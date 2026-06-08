import PageHeader from '../../components/app/ui/PageHeader';
import ProfileSection from '../../components/app/features/Settings/ProfileSection';
import CurrencySection from '../../components/app/features/Settings/CurrencySection';
import PasswordSection from '../../components/app/features/Settings/PasswordSection';
import DangerZone from '../../components/app/features/Settings/DangerZone';

export default function Settings() {
  return (
    <>
      <PageHeader title="Settings" description="Manage your account" />
      <div className="space-y-6 max-w-2xl">
        <ProfileSection />
        <CurrencySection />
        <PasswordSection />
        <DangerZone />
      </div>
    </>
  );
}