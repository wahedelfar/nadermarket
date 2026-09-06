import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { LoaderCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

type AdminRouteGuardProps = {
  children: ReactNode;
};

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [, setLocation] = useLocation();
  const session = trpc.admin.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (session.isError) {
      setLocation("/admin");
    }
  }, [session.isError, setLocation]);

  if (session.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-blue-700">
        <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 shadow-sm" role="status" aria-live="polite">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          جارٍ التحقق من صلاحيات الإدارة...
        </div>
      </div>
    );
  }

  if (session.isError || !session.data?.authenticated) return null;

  return <>{children}</>;
}
