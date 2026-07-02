import { LayoutDashboard } from 'lucide-react';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-muted/30 border-r flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Projectify</span>
        </div>
        <div>
          <blockquote className="text-lg text-muted-foreground leading-relaxed">
            &quot;The platform our team uses to ship faster without losing track of
            anything.&quot;
          </blockquote>
          <div className="mt-4">
            <p className="font-medium text-sm">Sarah Chen</p>
            <p className="text-xs text-muted-foreground">
              Engineering Lead, Acme Inc.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Projectify. All rights reserved.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 lg:hidden">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span className="font-semibold">Projectify</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
