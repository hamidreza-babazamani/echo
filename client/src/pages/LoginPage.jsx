import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../background.css";
import "../login.css";
//import "../background.css";
//import "../login.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    const credentials =
      currState === "Sign up"
        ? { fullName, email, password, bio }
        : { email, password };

    const success = await login(
      currState === "Sign up" ? "signup" : "login",
      credentials
    );

    if (success) {
      navigate("/");
    }
  };

  return (
    <>
      {/* ============ BACKGROUND LAYER ============ */}
      <div className="scene">
        <div className="sky"></div>
        <div className="giant-orb"></div>
        <div className="atmosphere"></div>
        <div className="mountains mountains-back"></div>
        <div className="mountains mountains-middle"></div>
        <div className="mountains mountains-front"></div>
        <div className="horizon-light"></div>
        <div className="lake">
          <div className="lake-reflection reflection-1"></div>
          <div className="lake-reflection reflection-2"></div>
          <div className="lake-reflection reflection-3"></div>
        </div>
        <div className="city">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="rock rock-left"></div>
        <div className="rock rock-right"></div>
        <div className="mist mist-1"></div>
        <div className="mist mist-2"></div>
      </div>

      {/* ============ CONTENT LAYER ============ */}
      <div className="echo-content">
        <header className="echo-header">
          <div className="echo-logo">
            <img src="/favicon.png" alt="Echo Chat" />
          </div>
          <h1>
            Echo <span>Chat</span>
          </h1>
        </header>

        <main className="echo-main">
          {/* HERO */}
          <section className="hero">
            <div className="hero-logo">
              <img src="/favicon.png" alt="Echo Chat" />
            </div>

            <h1>
              Echo <span>Chat</span>
            </h1>

            <p className="subtitle">
              Real-time conversations,
              <br />
              closer than ever.
            </p>

            <div className="features">
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <div>
                  <strong>Real-time</strong>
                  <small>Instant messaging</small>
                </div>
              </div>

              <div className="divider"></div>

              <div className="feature">
                <div className="feature-icon">🛡️</div>
                <div>
                  <strong>Secure</strong>
                  <small>Your privacy matters</small>
                </div>
              </div>

              <div className="divider"></div>

              <div className="feature">
                <div className="feature-icon">🌐</div>
                <div>
                  <strong>Connected</strong>
                  <small>Chat with anyone</small>
                </div>
              </div>
            </div>
          </section>

          {/* SIGNUP */}
          <section className="signup">
            <div className="signup-card">
              <div className="card-glow"></div>

              <h2>{currState === "Sign up" ? "Sign up" : "Login"}</h2>

              <p className="card-description">
                {currState === "Sign up"
                  ? "Create your account and start chatting in real time."
                  : "Welcome back! Log in to continue."}
              </p>

              <form onSubmit={onSubmitHandler}>
                {currState === "Sign up" && !isDataSubmitted && (
                  <div className="input-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"></path>
                    </svg>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      required
                    />
                  </div>
                )}

                {!isDataSubmitted && (
                  <>
                    <div className="input-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                        <path d="m3 7 9 6 9-6"></path>
                      </svg>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                      />
                    </div>

                    <div className="input-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="4" y="10" width="16" height="11" rx="2"></rect>
                        <path d="M8 10V7a4 4 0 1 1 8 0v3"></path>
                      </svg>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                      />
                    </div>
                  </>
                )}

                {currState === "Sign up" && isDataSubmitted && (
                  <textarea
                    className="bio-input"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Provide a short bio..."
                    required
                  ></textarea>
                )}

                <button type="submit" className="create-btn">
                  <span>
                    {currState === "Sign up"
                      ? isDataSubmitted
                        ? "Create Account"
                        : "Next"
                      : "Login Now"}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h13"></path>
                    <path d="m13 6 6 6-6 6"></path>
                  </svg>
                </button>

                <label className="terms">
                  <input type="checkbox" required />
                  <span className="custom-checkbox"></span>
                  <span>
                    Agree to the <a href="#">terms of use</a> &{" "}
                    <a href="#">privacy policy</a>.
                  </span>
                </label>

                <div className="login-link">
                  {currState === "Sign up" ? (
                    <>
                      <span>Already have an account?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrState("Login");
                          setIsDataSubmitted(false);
                        }}
                      >
                        Log in here
                      </button>
                    </>
                  ) : (
                    <>
                      <span>Don't have an account?</span>
                      <button
                        type="button"
                        onClick={() => setCurrState("Sign up")}
                      >
                        Sign up here
                      </button>
                    </>
                  )}
                </div>

                {isDataSubmitted && (
                  <button
                    type="button"
                    onClick={() => setIsDataSubmitted(false)}
                    className="back-btn"
                  >
                    ← Back
                  </button>
                )}
              </form>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default LoginPage;