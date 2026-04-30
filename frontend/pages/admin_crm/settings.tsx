/**
 * admin_crm/settings.tsx — Admin settings (analytics, pathways, rules, question coverage)
 * Aegis Health AI
 *
 * Platform administration and analytics dashboard.
 *
 * Sections:
 * - Summary stats (total consultations, outcomes, red flag rate)
 * - Daily consultation volume chart (text-based for demo)
 * - Clinical pathway status overview
 * - Red flag rules viewer
 *
 * Mock data: mirrors analytics seed data from seed.sql
 * In production: fetches from GET /api/admin/analytics and /api/admin/pathways
 */

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, ListChecks, Map, TriangleAlert } from 'lucide-react';
import CRMLayout from '../../components/CRMLayout';
import InlineNotice from '../../components/InlineNotice';
import { MOCK_DATA_DISCLOSURE } from '../../lib/complianceContent';
import StatusBadge from '../../components/StatusBadge';
import type { AdminRule } from '../../types/admin';
import { apiFetch, apiUrl } from '../../lib/api';
import { PATHWAY_QUESTIONS } from '../../lib/pathwayQuestions';
import OFFLINE_RED_FLAG_RULES from '../../lib/offlineRedFlagRules.json';

// ─── Mock analytics data ──────────────────────────────────────────────────────

const ANALYTICS = {
  period: 'Last 7 days',
  summary: {
    totalConsultations: 334,
    redFlagRate: '5.4%',
    pharmacyReferralRate: '40.4%',
    outcomeBreakdown: {
      selfCare:   104,
      pharmacy:   135,
      gp:          66,
      urgentCare:  15,
      emergency:   14,
    },
    totalRedFlagsTriggered: 18,
  },
  dailyTrend: [
    { date: '14 Apr', total: 42 },
    { date: '15 Apr', total: 38 },
    { date: '16 Apr', total: 55 },
    { date: '17 Apr', total: 61 },
    { date: '18 Apr', total: 47 },
    { date: '19 Apr', total: 33 },
    { date: '20 Apr', total: 58 },
  ],
};

const PATHWAYS = [
  { code: 'uti',          label: 'Uncomplicated UTI',      questions: 9, redFlags: 3, active: true },
  { code: 'sore_throat',  label: 'Sore Throat',            questions: 8, redFlags: 3, active: true },
  { code: 'sinusitis',    label: 'Sinusitis',              questions: 9, redFlags: 3, active: true },
  { code: 'otitis_media', label: 'Acute Otitis Media',     questions: 8, redFlags: 3, active: true },
  { code: 'insect_bites', label: 'Infected Insect Bites',  questions: 8, redFlags: 4, active: true },
  { code: 'impetigo',     label: 'Impetigo',               questions: 8, redFlags: 2, active: true },
  { code: 'shingles',     label: 'Shingles',               questions: 8, redFlags: 4, active: true },
];

type RuleFormState = {
  pathway: string;
  code: string;
  condition: string;
  outcome: string;
  active: boolean;
};

type PathwayMeta = {
  code: string;
  label: string;
};

type PathwayQuestion = {
  id?: string;
  text?: string;
  type?: string;
  required?: boolean;
};

type PathwayRedFlag = {
  code?: string;
  condition?: string;
  outcome?: string;
};

type PathwayDetailResponse = {
  pathway?: string;
  label?: string;
  questions?: PathwayQuestion[];
  redFlags?: PathwayRedFlag[];
};

type QuestionRow = {
  pathwayCode: string;
  pathwayLabel: string;
  questionId: string;
  questionText: string;
  questionType: string;
  required: boolean;
  hasRedFlag: boolean;
  matchedRedFlags: string[];
  source?: 'live' | 'custom';
};

const RED_FLAG_SAMPLES: AdminRule[] = [
  { id: 'RF_ST_001', pathway: 'Sore Throat', code: 'RF_ST_001', condition: 'Difficulty breathing', outcome: '999', active: true },
  { id: 'RF_UTI_001', pathway: 'UTI', code: 'RF_UTI_001', condition: 'Fever + loin pain', outcome: 'Urgent Care', active: true },
  { id: 'RF_SIN_001', pathway: 'Sinusitis', code: 'RF_SIN_001', condition: 'Eye swelling', outcome: '999', active: true },
  { id: 'RF_IB_001', pathway: 'Insect Bites', code: 'RF_IB_001', condition: 'Anaphylaxis signs', outcome: '999', active: true },
  { id: 'RF_SHG_001', pathway: 'Shingles', code: 'RF_SHG_001', condition: 'Eye involvement', outcome: '999', active: true },
];

const RULE_STORAGE_KEY = 'admin-dashboard-rules-v1';
const QUESTION_COVERAGE_STORAGE_KEY = 'admin-question-coverage-v1';
const EMPTY_RULE_FORM: RuleFormState = {
  pathway: '',
  code: '',
  condition: '',
  outcome: '',
  active: true,
};
const EMPTY_QUESTION_FORM = {
  pathwayCode: '',
  pathwayLabel: '',
  questionId: '',
  questionText: '',
  questionType: 'boolean',
  required: true,
  hasRedFlag: false,
  redFlagCode: '',
};

function extractQuestionIds(condition: string): string[] {
  const ids = condition.match(/\bq\d+\b/g) || [];
  return Array.from(new Set(ids));
}

function mapQuestionRedFlags(redFlags: Array<{ code?: string; condition?: string }>): Record<string, string[]> {
  return redFlags.reduce<Record<string, string[]>>((acc, flag) => {
    if (!flag.code || !flag.condition) return acc;
    const ids = extractQuestionIds(flag.condition);
    ids.forEach((id) => {
      if (!acc[id]) {
        acc[id] = [];
      }
      if (!acc[id].includes(flag.code!)) {
        acc[id].push(flag.code!);
      }
    });
    return acc;
  }, {});
}

function offlineQuestionRows(): QuestionRow[] {
  return Object.entries(PATHWAY_QUESTIONS).flatMap(([pathwayCode, questions]) => {
    const pathwayMeta = PATHWAYS.find((item) => item.code === pathwayCode);
    const pathwayLabel = pathwayMeta?.label || pathwayCode;
    const redFlagsByQuestion = mapQuestionRedFlags(OFFLINE_RED_FLAG_RULES[pathwayCode] || []);

    return questions.map((question, index) => {
      const questionId = question.id || `question_${index + 1}`;
      const matchedRedFlags = redFlagsByQuestion[questionId] || [];
      return {
        pathwayCode,
        pathwayLabel,
        questionId,
        questionText: question.text || 'Untitled question',
        questionType: question.type || 'unknown',
        required: !!question.required,
        hasRedFlag: matchedRedFlags.length > 0,
        matchedRedFlags,
        source: 'custom',
      };
    });
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pathways' | 'rules' | 'questions'>('pathways');
  const [rules, setRules] = useState<AdminRule[]>(RED_FLAG_SAMPLES);
  const [ruleForm, setRuleForm] = useState<RuleFormState>(EMPTY_RULE_FORM);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleSearch, setRuleSearch] = useState('');
  const [rulesError, setRulesError] = useState('');
  const [rulesSuccess, setRulesSuccess] = useState('');
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([]);
  const [questionFilter, setQuestionFilter] = useState<'all' | 'with_red_flag' | 'without_red_flag'>('all');
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionLoadError, setQuestionLoadError] = useState('');
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION_FORM);
  const [questionFormError, setQuestionFormError] = useState('');
  const [questionFormSuccess, setQuestionFormSuccess] = useState('');
  const [editingQuestionKey, setEditingQuestionKey] = useState<string | null>(null);
  const [questionSaving, setQuestionSaving] = useState(false);

  const { summary, dailyTrend } = ANALYTICS;
  const maxDaily = Math.max(...dailyTrend.map((d) => d.total));
  const pathwayOptions = useMemo(() => PATHWAYS.map((p) => p.label), []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedRules = window.localStorage.getItem(RULE_STORAGE_KEY);
    if (!storedRules) {
      return;
    }

    try {
      const parsed = JSON.parse(storedRules) as AdminRule[];
      if (Array.isArray(parsed)) {
        setRules(parsed);
      }
    } catch {
      setRulesError('Unable to load saved rules. Default rules were restored.');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(RULE_STORAGE_KEY, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    let cancelled = false;

    const loadQuestionCoverage = async () => {
      try {
        const pathwaysRes = await apiFetch(apiUrl('/api/admin/pathways'));
        if (!pathwaysRes.ok) {
          throw new Error('pathways');
        }
        const pathwaysData = (await pathwaysRes.json()) as { pathways?: PathwayMeta[] };
        const pathways = Array.isArray(pathwaysData.pathways) ? pathwaysData.pathways : [];
        const details = await Promise.all(
          pathways.map(async (pathway) => {
            const detailRes = await apiFetch(apiUrl(`/api/admin/rules/${encodeURIComponent(pathway.code)}`));
            if (!detailRes.ok) {
              throw new Error(`pathway:${pathway.code}`);
            }
            return (await detailRes.json()) as PathwayDetailResponse;
          }),
        );

        const rows: QuestionRow[] = details.flatMap((detail) => {
          const pathwayCode = detail.pathway || 'unknown';
          const pathwayLabel = detail.label || pathwayCode;
          const redFlags = Array.isArray(detail.redFlags) ? detail.redFlags : [];
          const questions = Array.isArray(detail.questions) ? detail.questions : [];
          const redFlagsByQuestion = mapQuestionRedFlags(redFlags);

          return questions.map((question, index) => {
            const questionId = question.id || `question_${index + 1}`;
            const matchedRedFlags = redFlagsByQuestion[questionId] || [];

            return {
              pathwayCode,
              pathwayLabel,
              questionId,
              questionText: question.text || 'Untitled question',
              questionType: question.type || 'unknown',
              required: !!question.required,
              hasRedFlag: matchedRedFlags.length > 0,
              matchedRedFlags,
              source: 'live',
            };
          });
        });

        if (!cancelled) {
          setQuestionRows(rows);
          setQuestionLoadError('');
        }
      } catch {
        if (cancelled) return;
        if (typeof window !== 'undefined') {
          const stored = window.localStorage.getItem(QUESTION_COVERAGE_STORAGE_KEY);
          if (stored) {
            try {
              const parsed = JSON.parse(stored) as QuestionRow[];
              if (Array.isArray(parsed) && parsed.length > 0) {
                setQuestionRows(parsed.map((row) => ({ ...row, source: row.source || 'custom' })));
                setQuestionLoadError('Could not load live question coverage from admin APIs. Showing saved local question coverage.');
                return;
              }
            } catch {
              // Fall through to empty state.
            }
          }
        }
        const offlineRows = offlineQuestionRows();
        setQuestionRows(offlineRows);
        setQuestionLoadError('Could not load live question coverage from admin APIs. Showing built-in local question coverage.');
      }
    };

    void loadQuestionCoverage();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(QUESTION_COVERAGE_STORAGE_KEY, JSON.stringify(questionRows));
  }, [questionRows]);

  const reloadQuestionCoverageFromApi = async () => {
    const pathwaysRes = await apiFetch(apiUrl('/api/admin/pathways'));
    if (!pathwaysRes.ok) {
      throw new Error('pathways');
    }
    const pathwaysData = (await pathwaysRes.json()) as { pathways?: PathwayMeta[] };
    const pathways = Array.isArray(pathwaysData.pathways) ? pathwaysData.pathways : [];
    const details = await Promise.all(
      pathways.map(async (pathway) => {
        const detailRes = await apiFetch(apiUrl(`/api/admin/rules/${encodeURIComponent(pathway.code)}`));
        if (!detailRes.ok) {
          throw new Error(`pathway:${pathway.code}`);
        }
        return (await detailRes.json()) as PathwayDetailResponse;
      }),
    );

    const rows: QuestionRow[] = details.flatMap((detail) => {
      const pathwayCode = detail.pathway || 'unknown';
      const pathwayLabel = detail.label || pathwayCode;
      const redFlags = Array.isArray(detail.redFlags) ? detail.redFlags : [];
      const questions = Array.isArray(detail.questions) ? detail.questions : [];

      return questions.map((question, index) => {
        const questionId = question.id || `question_${index + 1}`;
        const matchedRedFlags = redFlags
          .filter((flag) => (flag.condition || '').includes(questionId))
          .map((flag) => flag.code || 'RF_UNKNOWN');

        return {
          pathwayCode,
          pathwayLabel,
          questionId,
          questionText: question.text || 'Untitled question',
          questionType: question.type || 'unknown',
          required: !!question.required,
          hasRedFlag: matchedRedFlags.length > 0,
          matchedRedFlags,
          source: 'live',
        };
      });
    });

    setQuestionRows(rows);
    setQuestionLoadError('');
  };

  const filteredRules = useMemo(() => {
    const query = ruleSearch.trim().toLowerCase();
    if (!query) {
      return rules;
    }

    return rules.filter((rule) =>
      [rule.pathway, rule.code, rule.condition, rule.outcome].some((value) => value.toLowerCase().includes(query))
    );
  }, [ruleSearch, rules]);

  const filteredQuestionRows = useMemo(() => {
    const query = questionSearch.trim().toLowerCase();
    return questionRows.filter((row) => {
      if (questionFilter === 'with_red_flag' && !row.hasRedFlag) return false;
      if (questionFilter === 'without_red_flag' && row.hasRedFlag) return false;
      if (!query) return true;
      return [row.pathwayLabel, row.pathwayCode, row.questionId, row.questionText, row.questionType]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [questionFilter, questionRows, questionSearch]);

  const saveQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuestionFormError('');
    setQuestionFormSuccess('');
    setQuestionSaving(true);

    const pathwayCode = questionForm.pathwayCode.trim().toLowerCase();
    const pathwayLabel = questionForm.pathwayLabel.trim();
    const questionId = questionForm.questionId.trim();
    const questionText = questionForm.questionText.trim();
    const questionType = questionForm.questionType.trim();
    const redFlagCode = questionForm.redFlagCode.trim().toUpperCase();

    if (!pathwayCode || !pathwayLabel || !questionId || !questionText || !questionType) {
      setQuestionFormError('Pathway code, pathway label, question ID, question text, and question type are required.');
      setQuestionSaving(false);
      return;
    }
    if (questionForm.hasRedFlag && !redFlagCode) {
      setQuestionFormError('Please enter a red-flag code when "Has red flag" is selected.');
      setQuestionSaving(false);
      return;
    }

    const duplicate = questionRows.find((row) => {
      const currentKey = `${pathwayCode}:${questionId}`.toLowerCase();
      const rowKey = `${row.pathwayCode}:${row.questionId}`.toLowerCase();
      if (editingQuestionKey && rowKey === editingQuestionKey.toLowerCase()) return false;
      return rowKey === currentKey;
    });
    if (duplicate) {
      setQuestionFormError(`Question "${questionId}" already exists for pathway "${pathwayCode}".`);
      setQuestionSaving(false);
      return;
    }

    const payload = {
      id: questionId,
      text: questionText,
      type: questionType,
      required: questionForm.required,
      redFlag: questionForm.hasRedFlag
        ? {
            code: redFlagCode,
            condition: `${questionId} === true`,
            outcome: 'urgent_care',
            description: `Rule linked to ${questionId}`,
            message: 'Please seek medical advice.',
          }
        : null,
    };

    try {
      const existing = editingQuestionKey
        ? questionRows.find((row) => `${row.pathwayCode}:${row.questionId}`.toLowerCase() === editingQuestionKey.toLowerCase())
        : null;

      if (editingQuestionKey && existing?.source === 'live') {
        const response = await apiFetch(
          apiUrl(`/api/admin/pathways/${encodeURIComponent(existing.pathwayCode)}/questions/${encodeURIComponent(existing.questionId)}`),
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok) {
          throw new Error('update-live-question');
        }
        await reloadQuestionCoverageFromApi();
      } else {
        const createResponse = await apiFetch(
          apiUrl(`/api/admin/pathways/${encodeURIComponent(pathwayCode)}/questions`),
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );

        if (createResponse.ok) {
          await reloadQuestionCoverageFromApi();
        } else {
          const newRow: QuestionRow = {
            pathwayCode,
            pathwayLabel,
            questionId,
            questionText,
            questionType,
            required: questionForm.required,
            hasRedFlag: questionForm.hasRedFlag,
            matchedRedFlags: questionForm.hasRedFlag ? [redFlagCode] : [],
            source: 'custom',
          };
          if (editingQuestionKey) {
            setQuestionRows((current) =>
              current.map((row) =>
                `${row.pathwayCode}:${row.questionId}`.toLowerCase() === editingQuestionKey.toLowerCase()
                  ? newRow
                  : row,
              ),
            );
          } else {
            setQuestionRows((current) => [newRow, ...current]);
          }
        }
      }

      setQuestionForm(EMPTY_QUESTION_FORM);
      setEditingQuestionKey(null);
      setQuestionFormSuccess(editingQuestionKey ? `Question "${questionId}" updated.` : `Question "${questionId}" added to coverage list.`);
    } catch {
      setQuestionFormError('Could not save question entry.');
    } finally {
      setQuestionSaving(false);
    }
  };

  const editQuestion = (row: QuestionRow) => {
    setQuestionForm({
      pathwayCode: row.pathwayCode,
      pathwayLabel: row.pathwayLabel,
      questionId: row.questionId,
      questionText: row.questionText,
      questionType: row.questionType,
      required: row.required,
      hasRedFlag: row.hasRedFlag,
      redFlagCode: row.hasRedFlag ? row.matchedRedFlags[0] || '' : '',
    });
    setEditingQuestionKey(`${row.pathwayCode}:${row.questionId}`);
    setQuestionFormError('');
    setQuestionFormSuccess('');
  };

  const deleteQuestion = async (row: QuestionRow) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete question "${row.questionId}" from "${row.pathwayCode}"?`)) {
      return;
    }

    try {
      if (row.source === 'live') {
        const response = await apiFetch(
          apiUrl(`/api/admin/pathways/${encodeURIComponent(row.pathwayCode)}/questions/${encodeURIComponent(row.questionId)}`),
          { method: 'DELETE' },
        );
        if (!response.ok) {
          throw new Error('delete-live-question');
        }
        await reloadQuestionCoverageFromApi();
      } else {
        setQuestionRows((current) =>
          current.filter(
            (item) => !(
              item.source === 'custom' &&
              item.pathwayCode === row.pathwayCode &&
              item.questionId === row.questionId
            ),
          ),
        );
      }
      if (editingQuestionKey && editingQuestionKey.toLowerCase() === `${row.pathwayCode}:${row.questionId}`.toLowerCase()) {
        setQuestionForm(EMPTY_QUESTION_FORM);
        setEditingQuestionKey(null);
      }
      setQuestionFormError('');
      setQuestionFormSuccess(`Question "${row.questionId}" deleted.`);
    } catch {
      setQuestionFormError(`Could not delete question "${row.questionId}".`);
    }
  };

  const resetRuleForm = () => {
    setRuleForm(EMPTY_RULE_FORM);
    setEditingRuleId(null);
  };

  const startEditRule = (rule: AdminRule) => {
    setRuleForm({
      pathway: rule.pathway,
      code: rule.code,
      condition: rule.condition,
      outcome: rule.outcome,
      active: rule.active,
    });
    setEditingRuleId(rule.id);
    setRulesError('');
    setRulesSuccess('');
  };

  const saveRule = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRulesError('');
    setRulesSuccess('');

    const sanitized: RuleFormState = {
      pathway: ruleForm.pathway.trim(),
      code: ruleForm.code.trim().toUpperCase(),
      condition: ruleForm.condition.trim(),
      outcome: ruleForm.outcome.trim(),
      active: ruleForm.active,
    };

    if (!sanitized.pathway || !sanitized.code || !sanitized.condition || !sanitized.outcome) {
      setRulesError('Pathway, rule code, trigger condition, and escalation are required.');
      return;
    }

    const duplicate = rules.find((rule) => rule.code === sanitized.code && rule.id !== editingRuleId);
    if (duplicate) {
      setRulesError(`Rule code "${sanitized.code}" already exists.`);
      return;
    }

    if (editingRuleId) {
      setRules((currentRules) =>
        currentRules.map((rule) =>
          rule.id === editingRuleId
            ? { ...rule, pathway: sanitized.pathway, code: sanitized.code, condition: sanitized.condition, outcome: sanitized.outcome, active: sanitized.active }
            : rule
        )
      );
      setRulesSuccess(`Rule "${sanitized.code}" updated successfully.`);
    } else {
      setRules((currentRules) => [
        {
          id: sanitized.code,
          pathway: sanitized.pathway,
          code: sanitized.code,
          condition: sanitized.condition,
          outcome: sanitized.outcome,
          active: sanitized.active,
        },
        ...currentRules,
      ]);
      setRulesSuccess(`Rule "${sanitized.code}" created successfully.`);
    }

    resetRuleForm();
  };

  const deleteRule = (ruleId: string) => {
    const existingRule = rules.find((rule) => rule.id === ruleId);
    if (!existingRule) {
      return;
    }

    if (typeof window !== 'undefined' && !window.confirm(`Delete rule "${existingRule.code}"?`)) {
      return;
    }

    setRules((currentRules) => currentRules.filter((rule) => rule.id !== ruleId));
    if (editingRuleId === ruleId) {
      resetRuleForm();
    }
    setRulesError('');
    setRulesSuccess(`Rule "${existingRule.code}" deleted.`);
  };

  const toggleRuleActive = (ruleId: string) => {
    let updatedRule: AdminRule | null = null;
    setRules((currentRules) =>
      currentRules.map((rule) => {
        if (rule.id !== ruleId) {
          return rule;
        }
        updatedRule = { ...rule, active: !rule.active };
        return updatedRule;
      })
    );

    if (updatedRule) {
      setRulesError('');
      setRulesSuccess(`Rule "${updatedRule.code}" ${updatedRule.active ? 'activated' : 'deactivated'}.`);
    }
  };

  return (
    <CRMLayout title="Admin Settings" subtitle="Dr. Admin User · Analytics, pathways, rules, and question coverage">
      <div className="mx-auto max-w-7xl">
        <InlineNotice title="Demo mode" tone="warning" className="mb-4">
          {MOCK_DATA_DISCLOSURE} Rules are persisted locally in this browser via localStorage.
        </InlineNotice>

        {/* Tab navigation */}
        <div className="flex gap-4 mb-8 border-b border-border">
          {(
            [
              { id: 'pathways' as const, label: 'Pathways', Icon: Map },
              { id: 'rules' as const, label: 'Rules', Icon: TriangleAlert },
              { id: 'questions' as const, label: 'Question Coverage', Icon: ListChecks },
              { id: 'overview' as const, label: 'Overview', Icon: LayoutDashboard },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-all inline-flex items-center gap-2 ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Consultations',   value: summary.totalConsultations.toLocaleString(), colour: 'text-primary',  bg: 'bg-primary/10' },
                { label: 'Pharmacy Referral Rate', value: summary.pharmacyReferralRate,                colour: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Red Flag Rate',          value: summary.redFlagRate,                         colour: 'text-red-600',   bg: 'bg-red-50' },
                { label: 'Red Flags Triggered',    value: summary.totalRedFlagsTriggered.toString(),   colour: 'text-orange-600',bg: 'bg-orange-50' },
              ].map((kpi) => (
                <div key={kpi.label} className={`${kpi.bg} rounded-xl p-5 border border-border shadow-card`}>
                  <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${kpi.colour}`}>{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                </div>
              ))}
            </div>

            {/* Outcome breakdown */}
            <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Outcome Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Self-Care',   value: summary.outcomeBreakdown.selfCare,   colour: 'bg-green-400' },
                  { label: 'Pharmacy',    value: summary.outcomeBreakdown.pharmacy,   colour: 'bg-blue-400' },
                  { label: 'GP',          value: summary.outcomeBreakdown.gp,         colour: 'bg-yellow-400' },
                  { label: 'Urgent Care', value: summary.outcomeBreakdown.urgentCare, colour: 'bg-orange-400' },
                  { label: 'Emergency',   value: summary.outcomeBreakdown.emergency,  colour: 'bg-red-400' },
                ].map((item) => {
                  const pct = ((item.value / summary.totalConsultations) * 100).toFixed(1);
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-24">{item.label}</span>
                      <div className="flex-1 bg-muted rounded-full h-3">
                        <div
                          className={`${item.colour} h-3 rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-16 text-right">{item.value} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily volume chart */}
            <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Daily Consultation Volume</h3>
              <div className="flex items-end gap-3 h-32">
                {dailyTrend.map((day) => (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{day.total}</span>
                    <div
                      className="w-full bg-primary rounded-t-sm"
                      style={{ height: `${(day.total / maxDaily) * 100}px` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Pathways Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'pathways' && (
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  {['Pathway', 'Code', 'Questions', 'Red Flags', 'Status'].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {PATHWAYS.map((p) => (
                  <tr key={p.code} className="hover:bg-muted/50">
                    <td className="px-5 py-4 font-medium text-foreground text-sm">{p.label}</td>
                    <td className="px-5 py-4 text-muted-foreground text-xs font-mono">{p.code}</td>
                    <td className="px-5 py-4 text-muted-foreground text-sm">{p.questions}</td>
                    <td className="px-5 py-4 text-sm">
                      <StatusBadge label={`${p.redFlags} flags`} tone="danger" />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label="Active" tone="success" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Rules Tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 flex gap-3">
              <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" strokeWidth={1.75} aria-hidden />
              <p>
                Rules can be managed here for frontend testing. This currently updates only local browser state and storage.
              </p>
            </div>
            <form onSubmit={saveRule} className="bg-card rounded-2xl shadow-card border border-border p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{editingRuleId ? 'Edit Rule' : 'Add Rule'}</h3>
                {editingRuleId && (
                  <button
                    type="button"
                    onClick={resetRuleForm}
                    className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Cancel editing
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm text-foreground">
                  Pathway
                  <input
                    type="text"
                    list="pathway-options"
                    value={ruleForm.pathway}
                    onChange={(event) => setRuleForm((currentForm) => ({ ...currentForm, pathway: event.target.value }))}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="e.g. Sinusitis"
                  />
                  <datalist id="pathway-options">
                    {pathwayOptions.map((pathway) => (
                      <option key={pathway} value={pathway} />
                    ))}
                  </datalist>
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-foreground">
                  Rule Code
                  <input
                    type="text"
                    value={ruleForm.code}
                    onChange={(event) => setRuleForm((currentForm) => ({ ...currentForm, code: event.target.value }))}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="e.g. RF_SIN_002"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-1.5 text-sm text-foreground">
                  Trigger Condition
                  <input
                    type="text"
                    value={ruleForm.condition}
                    onChange={(event) => setRuleForm((currentForm) => ({ ...currentForm, condition: event.target.value }))}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="e.g. Severe unilateral facial pain"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm text-foreground">
                  Escalation
                  <input
                    type="text"
                    value={ruleForm.outcome}
                    onChange={(event) => setRuleForm((currentForm) => ({ ...currentForm, outcome: event.target.value }))}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="e.g. Urgent Care"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={ruleForm.active}
                    onChange={(event) => setRuleForm((currentForm) => ({ ...currentForm, active: event.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  Active
                </label>
              </div>
              {rulesError ? <p className="text-sm text-red-600">{rulesError}</p> : null}
              {rulesSuccess ? <p className="text-sm text-green-700">{rulesSuccess}</p> : null}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {editingRuleId ? 'Update rule' : 'Add rule'}
                </button>
              </div>
            </form>
            <div className="bg-card rounded-2xl shadow-card border border-border p-4">
              <label className="block text-sm text-foreground">
                Search rules
                <input
                  type="text"
                  value={ruleSearch}
                  onChange={(event) => setRuleSearch(event.target.value)}
                  placeholder="Search by pathway, code, condition, or escalation"
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    {['Pathway', 'Rule Code', 'Trigger Condition', 'Escalation', 'Active'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                    ))}
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRules.map((r) => (
                    <tr key={r.code} className="hover:bg-muted/50">
                      <td className="px-5 py-4 text-foreground text-sm font-medium">{r.pathway}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs font-mono">{r.code}</td>
                      <td className="px-5 py-4 text-muted-foreground text-sm">{r.condition}</td>
                      <td className="px-5 py-4">
                        <StatusBadge label={r.outcome} tone={r.outcome === '999' ? 'danger' : 'warning'} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={r.active ? 'Yes' : 'No'} tone={r.active ? 'success' : 'neutral'} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEditRule(r)}
                            className="rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleRuleActive(r.id)}
                            className="rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            {r.active ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRule(r.id)}
                            className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRules.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-6 text-sm text-muted-foreground text-center">
                        No rules found for the current search.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Questions Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <form onSubmit={saveQuestion} className="bg-card rounded-2xl shadow-card border border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{editingQuestionKey ? 'Edit Custom Question Entry' : 'Add Question Coverage Entry'}</h3>
                <StatusBadge label="Local only" tone="warning" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-sm text-foreground">
                  Pathway code
                  <input
                    type="text"
                    value={questionForm.pathwayCode}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, pathwayCode: event.target.value }))}
                    placeholder="e.g. uti"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="text-sm text-foreground">
                  Pathway label
                  <input
                    type="text"
                    value={questionForm.pathwayLabel}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, pathwayLabel: event.target.value }))}
                    placeholder="e.g. Uncomplicated UTI"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="text-sm text-foreground">
                  Question ID
                  <input
                    type="text"
                    value={questionForm.questionId}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, questionId: event.target.value }))}
                    placeholder="e.g. q10"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="text-sm text-foreground md:col-span-2">
                  Question text
                  <input
                    type="text"
                    value={questionForm.questionText}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, questionText: event.target.value }))}
                    placeholder="e.g. Are symptoms worsening rapidly?"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </label>
                <label className="text-sm text-foreground">
                  Question type
                  <select
                    value={questionForm.questionType}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, questionType: event.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    <option value="boolean">boolean</option>
                    <option value="select">select</option>
                    <option value="multiselect">multiselect</option>
                    <option value="text">text</option>
                    <option value="number">number</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={questionForm.required}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, required: event.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  Required question
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={questionForm.hasRedFlag}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, hasRedFlag: event.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  Has red flag
                </label>
                {questionForm.hasRedFlag ? (
                  <label className="text-sm text-foreground">
                    Red-flag code
                    <input
                      type="text"
                      value={questionForm.redFlagCode}
                      onChange={(event) => setQuestionForm((current) => ({ ...current, redFlagCode: event.target.value }))}
                      placeholder="e.g. RF_UTI_010"
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </label>
                ) : null}
              </div>
              {questionFormError ? <p className="text-sm text-red-600">{questionFormError}</p> : null}
              {questionFormSuccess ? <p className="text-sm text-green-700">{questionFormSuccess}</p> : null}
              <div className="flex justify-end">
                <div className="flex items-center gap-2">
                  {editingQuestionKey ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuestionForm(EMPTY_QUESTION_FORM);
                        setEditingQuestionKey(null);
                        setQuestionFormError('');
                        setQuestionFormSuccess('');
                      }}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={questionSaving}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {questionSaving ? 'Saving...' : editingQuestionKey ? 'Update question' : 'Add question'}
                  </button>
                </div>
              </div>
            </form>

            <div className="bg-card rounded-2xl shadow-card border border-border p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="text-sm text-foreground">
                  Red-flag coverage
                  <select
                    value={questionFilter}
                    onChange={(event) => setQuestionFilter(event.target.value as 'all' | 'with_red_flag' | 'without_red_flag')}
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="all">All questions</option>
                    <option value="with_red_flag">With red-flag mapping</option>
                    <option value="without_red_flag">Without red-flag mapping</option>
                  </select>
                </label>
                <label className="text-sm text-foreground md:col-span-2">
                  Search questions
                  <input
                    type="text"
                    value={questionSearch}
                    onChange={(event) => setQuestionSearch(event.target.value)}
                    placeholder="Search by pathway, question id, question text, or type"
                    className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              </div>
            </div>

            {questionLoadError ? (
              <InlineNotice title="Question coverage unavailable" tone="warning">
                {questionLoadError}
              </InlineNotice>
            ) : null}

            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    {['Pathway', 'Question ID', 'Question', 'Type', 'Required', 'Red Flag Coverage', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredQuestionRows.map((row) => (
                    <tr key={`${row.pathwayCode}-${row.questionId}`} className="hover:bg-muted/50">
                      <td className="px-5 py-4 text-foreground text-sm">
                        <p className="font-medium">{row.pathwayLabel}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{row.pathwayCode}</p>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground font-mono">{row.questionId}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{row.questionText}</td>
                      <td className="px-5 py-4">
                        <StatusBadge label={row.questionType} tone="info" />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={row.required ? 'Yes' : 'No'} tone={row.required ? 'success' : 'neutral'} />
                      </td>
                      <td className="px-5 py-4">
                        {row.hasRedFlag ? (
                          <div className="space-y-1">
                            <StatusBadge label="Mapped" tone="danger" />
                            <p className="text-[11px] text-muted-foreground">{row.matchedRedFlags.join(', ')}</p>
                          </div>
                        ) : (
                          <StatusBadge label="No red flag" tone="neutral" />
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => editQuestion(row)}
                            className="rounded border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteQuestion(row)}
                            className="rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredQuestionRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-6 text-sm text-muted-foreground text-center">
                        No questions match the selected filter.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
