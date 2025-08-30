const e = React.createElement;

function App() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [token, setToken] = React.useState("");
  const [profile, setProfile] = React.useState(null);

  const API_URL = "http://localhost:5000"; // использовать имя контейнера backend

  async function register() {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) alert("Registered!");
    else alert("Registration failed");
  }

  async function login() {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) setToken(data.token);
    else alert("Login failed");
  }

  async function getProfile() {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setProfile(data);
  }

  return e("div", { style: { padding: 20 } },
    e("h1", null, "Login / Register"),
    e("input", { placeholder: "email", value: email, onChange: e => setEmail(e.target.value) }),
    e("input", { placeholder: "password", type: "password", value: password, onChange: e => setPassword(e.target.value) }),
    e("div", { style: { marginTop: 10 } },
      e("button", { onClick: register }, "Register"),
      e("button", { onClick: login, style: { marginLeft: 10 } }, "Login")
    ),
    e("hr"),
    token && e("button", { onClick: getProfile }, "Get Profile"),
    profile && e("pre", null, JSON.stringify(profile, null, 2))
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(e(App));
