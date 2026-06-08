import { useEffect, useState } from 'react';
import PageHeader from '../../components/app/ui/PageHeader';
import MemberCard from '../../components/app/features/Team/MemberCard';
import InviteModal from '../../components/app/features/Team/InviteModal';
import EmptyState from '../../components/app/ui/EmptyState';
import { FiUsers, FiPlus } from 'react-icons/fi';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);

  return (
    <>
      <PageHeader title="Team" description="Manage team members" action={
        <button onClick={() => setShowInvite(true)} className="btn-primary btn-sm"><FiPlus size={16} className="mr-1" /> Invite</button>
      } />
      {members.length === 0 ? (
        <EmptyState icon={FiUsers} title="No team members" description="Invite your first team member" />
      ) : (
        <div className="space-y-3">
          {members.map((m) => <MemberCard key={m._id} member={m} />)}
        </div>
      )}
      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} onInvite={(data) => console.log(data)} />
    </>
  );
}