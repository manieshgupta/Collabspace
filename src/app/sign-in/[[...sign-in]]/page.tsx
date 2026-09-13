import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070B18] px-4">
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/documents"
      />
    </div>
  );
};

export default SignInPage;
