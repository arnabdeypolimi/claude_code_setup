import { execFileSync } from 'node:child_process';

/**
 * Check whether an executable is available in PATH.
 */
export function commandAvailable(name) {
  try {
    execFileSync(name, ['--version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Render an argv array as a copy-pasteable shell command.
 */
export function formatCommand(argv) {
  return argv.map(a => (/[^\w@%+=:,./-]/.test(a) ? `"${a}"` : a)).join(' ');
}

/**
 * Run an argv array with output streamed to the terminal. Returns true on success.
 */
export function runCommand([cmd, ...args]) {
  try {
    execFileSync(cmd, args, { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}
