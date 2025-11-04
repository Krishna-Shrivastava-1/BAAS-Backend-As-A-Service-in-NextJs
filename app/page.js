import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      Home Page
      <Link href={'/sign-in'}>
      <Button>Signin</Button>
      </Link>
      <Link href={'/sign-up'}>
      <Button>Signup</Button>
      </Link>
    </div>
  );
}
