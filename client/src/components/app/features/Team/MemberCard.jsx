import Avatar from '../../layout/Avatar';

export default function MemberCard({ member }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
      <div className="flex items-center space-x-3">
        <Avatar firstName={member.firstName} lastName={member.lastName} />
        <div>
          <p className="text-sm font-medium text-gray-900">{member.firstName} {member.lastName}</p>
          <p className="text-xs text-gray-500">{member.email}</p>
        </div>
      </div>
      <span className="badge bg-gray-100 text-gray-700 capitalize">{member.role}</span>
    </div>
  );
}