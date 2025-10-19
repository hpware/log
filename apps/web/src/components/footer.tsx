import Link from "next/link";
export default function Footer() {
  return (
    <footer className="relative bottom-0 inset-x-0 justify-center text-center">
      <hr />
      <span className="p-3">
        This project is{" "}
        <Link
          href="https://github.com/hpware/log/"
          className="text-blue-500 hover:text-blue-500/70 dark:text-blue-400 dark:hover:text-blue-400/70 transition-all duration-300"
        >
          open source
        </Link>
        .
      </span>
    </footer>
  );
}
