"use client";

import InputWrapper from "@/components/InputWrapper";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { get } from "lodash";
import { formSchema } from "./schema";
import { postRequest } from "@/services/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "universal-cookie";

export default function Signin() {

  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true)
    const payload = {
      email: data.email,
      password: data.password,
    };
    
     try {
      const res = await postRequest({data : {...payload} , url : "/api/login"})
      if(res){
        toast.success("Login Successfully.")
        const cookies = new Cookies();
        cookies.set("token",res?.data?.token)
        cookies.set('userId',res?.data?._id)
        cookies.set("admin",res?.data?.admin)
        
        router.push("/")
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
     }
    
    
  }

  const {
    formState: { errors },
    setValue,
  } = form;

  return (
    <div className="h-screen flex justify-center flex-col">
      <div className="flex justify-center">
        <div
          className="block w-2/5 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 "
        >
          <div>
            <div className="w-full text-center mb-4 text-3xl font-extrabold">
              Sign in
            </div>
            <div className="pt-2">
              <Form {...form}>
                <form className="" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex flex-col gap-8">
                    <InputWrapper
                      required
                      className={`rounded-lg border border-solid ${
                        get(errors, "name", false)
                          ? "border-2 border-destructive"
                          : "border-input"
                      }  p-3`}
                      form={form}
                      name="email"
                      placeholder="john@gmail.com"
                      renderComponent={(props: any) => (
                        <Input {...props} type="email" />
                      )}
                      title="User Email"
                    />
                    <InputWrapper
                      required
                      className={`rounded-lg border border-solid ${
                        get(errors, "name", false)
                          ? "border-2 border-destructive"
                          : "border-input"
                      }  p-2`}
                      form={form}
                      name="password"
                      placeholder="Password"
                      renderComponent={(props: any) => (
                        <Input {...props} type="password" />
                      )}
                      title="Password"
                    />
                  </div>
                  <Button disabled={loading} className="mt-8 w-full text-white bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2">
                    { loading ?  <div className="loader w-5 h-5 border-4 border-t-4 border-gray-400 rounded-full animate-spin"></div> :  "Sign in"}
                  </Button>
                </form>
              </Form>
              <p className="text-center mt-4">
              {`Don't have an account?`}
              <span
                className="text-blue-500 cursor-pointer"
                onClick={() => router.push("/signup")}
              >
                Sign up
              </span>
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
