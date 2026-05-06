import ProviderLayout from '../../components/ProviderLayout';

export default function ProviderProfilePage() {
  return (
    <ProviderLayout title="Provider Profile" subtitle="Provider account and role information">
      <div className="bg-card rounded-2xl border border-border p-5 space-y-3 max-w-xl">
        <div>
          <p className="text-xs text-muted-foreground">Name</p>
          <p className="text-sm font-semibold text-foreground">Dr. Provider User</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Role</p>
          <p className="text-sm font-semibold text-foreground">Clinical Provider</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="text-sm font-semibold text-foreground">provider@aegishealth.ai</p>
        </div>
      </div>
    </ProviderLayout>
  );
}
