type HelperUrgentNoticeProps = {
  show: boolean;
};

export function HelperUrgentNotice({ show }: HelperUrgentNoticeProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="rounded-md border border-amber-200 bg-warn-soft px-3 py-2 text-sm leading-6 text-amber-950">
      <p className="font-semibold">Urgent — needs a quick check</p>
      <p className="mt-0.5">
        Someone is waiting before they pay, leave, or miss an option. A fast
        reply helps.
      </p>
    </div>
  );
}
