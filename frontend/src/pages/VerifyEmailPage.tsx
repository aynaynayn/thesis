import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { authApi } from "../lib/api";
import { useRouter } from "../context/RouterContext";

export default function VerifyEmailPage() {
  const { navigate } = useRouter();
  const [state, setState] = useState<{ message: string; error: boolean }>({
    message: "Verifying your email address",
    error: false,
  });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState({
        message: "The verification link is missing its token.",
        error: true,
      });
      return;
    }
    void authApi
      .verifyEmail(token)
      .then((result) => setState({ message: result.message, error: false }))
      .catch((error: Error) =>
        setState({ message: error.message, error: true }),
      );
  }, []);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center bg-card border border-border rounded-3xl p-8">
        <CheckCircle
          size={42}
          className={
            state.error ? "mx-auto text-destructive" : "mx-auto text-green-600"
          }
        />
        <h1 className="mt-5 text-2xl font-extrabold text-foreground">
          Email verification
        </h1>
        <p className="mt-3 text-muted-foreground">{state.message}</p>
        <button
          onClick={() => navigate("auth")}
          className="mt-7 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold"
        >
          Go to sign in
        </button>
      </div>
    </main>
  );
}
