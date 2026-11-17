type Account = {
  name: string;
  email: string;
  password: string;
};

// Demo accounts live in memory for the current app session.
const accounts: Account[] = [];

export function registerAccount(name: string, email: string, password: string) {
  const username = email.trim().toLowerCase();

  if (accounts.some((account) => account.email === username)) {
    return false;
  }

  accounts.push({ name: name.trim(), email: username, password });
  return true;
}

export function checkLogin(username: string, password: string) {
  const email = username.trim().toLowerCase();
  return accounts.some((account) => account.email === email && account.password === password);
}
