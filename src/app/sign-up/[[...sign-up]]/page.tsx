import { SignUp } from "@clerk/nextjs";

const SignUpPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070B18] px-4">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/documents"
      />
    </div>
  );
};

export default SignUpPage;
