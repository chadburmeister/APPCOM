import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-6 py-20">
      <h1 className="mb-1 text-2xl font-bold text-purple-deep">
        Create an account
      </h1>
      <p className="mb-6 text-sm text-gray-text">
        Set up your login to start scoring calls.
      </p>
      <RegisterForm />
    </div>
  );
}
