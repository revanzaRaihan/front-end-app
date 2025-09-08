import Link from "next/link";

export default function Page() {
  return (
    <div>
      <h1>page 2!</h1>
      <Link href="/">Go back</Link>
      <Link href="./">Go page 1</Link>
    </div>
  );
}