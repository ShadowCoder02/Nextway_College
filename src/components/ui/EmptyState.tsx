import { Card } from "@/components/ui/Card";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  heading: string;
  body?: ReactNode;
  action?: ReactNode;
};

export function EmptyState({ icon, heading, body, action }: EmptyStateProps) {
  return (
    <Card padding="lg" className="text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-gold-text" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-bold text-navy">{heading}</h3>
      {body && <div className="mx-auto max-w-md text-sm text-slate">{body}</div>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}
