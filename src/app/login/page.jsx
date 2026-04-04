"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { loginService } from "@/services/auth.service";
import { useAuth } from "@/context/auth-context";

export default function LoginForm() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();

async function handleSubmit(e) {

  e.preventDefault();

  setLoading(true);
  setError("");

  try {

    const user = await loginService({
      email,
      password,
    });

    await login(user);

    router.push("/dashboard");

  } catch (err) {

    setError(err.message);

  } finally {

    setLoading(false);

  }

}

//   async function handleSubmit(e) {

//     e.preventDefault();

//     setError("");
//     setLoading(true);

//     try {

//       await loginService({
//         email,
//         password,
//       });

//       router.push("/dashboard");

//     } catch (err) {

//       setError(err.message);

//     } finally {

//       setLoading(false);

//     }

//   }

  return (
    <Card className="w-full max-w-md">

      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <CardContent>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

        </form>

      </CardContent>

    </Card>
  );
}