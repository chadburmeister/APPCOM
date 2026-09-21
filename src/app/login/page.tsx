import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-6 py-20">
      <h1 className="mb-1 text-2xl font-bold text-purple-deep">Sign in</h1>
      <p className="mb-6 text-sm text-gray-text">
        Score calls against the APPCOM framework.
      </p>
      <LoginForm next={next} />
    </div>
  );
}
