import ProfileAvatar from "@/components/shared/profile-avatar";

export default function UserMessage({
  text,
  profileImageUrl,
  initials,
}: {
  text: string;
  profileImageUrl?: string | null;
  initials?: string;
}) {
  return (
    <div className="ml-auto flex max-w-2xl items-end gap-2">
      <p className="rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
        {text}
      </p>
      <ProfileAvatar
        src={profileImageUrl}
        alt="User profile picture"
        initials={initials}
        className="h-8 w-8 rounded-full"
        iconClassName="h-3.5 w-3.5"
      />
    </div>
  );
}
