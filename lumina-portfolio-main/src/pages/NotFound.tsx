import { CustomCursor } from "@/components/CustomCursor";

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center px-6">
    <CustomCursor />
    <div className="text-center">
      <p className="font-display text-6xl text-gold-500">404</p>
      <p className="mt-4 text-sm text-muted">Nothing here.</p>
      <a href="/" className="link mt-8 inline-block text-sm">
        Back to the top
      </a>
    </div>
  </div>
);

export default NotFound;
