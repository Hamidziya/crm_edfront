import React, { useState } from "react";
import { toast } from "react-toastify";
import AxiosService from "../../components/utils/ApiService";
import { useNavigate, Link } from "react-router-dom";
import signincss from "./signin.module.css";
import Spinner from "../../components/utils/Sipnners";
import { FiEye, FiEyeOff } from "react-icons/fi";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const res = await AxiosService.post(`/user/login`, { email, password });

      if (res.status === 200) {
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("userData", JSON.stringify(res.data.userData));
        if (res.data.userData.status === "InActive") {
          navigate("/");
          toast.error("You are not Allow to login");
        } else if (res.data.userData.role === "admin") {
          toast.success(res.data.message);
          navigate("/dashboard");
        } else {
          toast.success(res.data.message);
          navigate("/userdash");
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={signincss.Signin}>
      <div className={signincss.circles}>
        <div className={signincss.circle1}></div>
        <div className={signincss.circle2}></div>
      </div>

      <div className={signincss.wrapper}>
        {/* Welcome Heading */}
        <h6 className={signincss.welcome}>Welcome to EdGlobal</h6>

        <form className={signincss.loginform} onSubmit={handleLogin}>
          <h2 className={signincss.heading}>Login</h2>

          {/* Email Input */}
          <div className={signincss.inputfield}>
            <input
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Enter your email</label>
          </div>

          {/* Password Input with Eye Toggle */}
          <div className={signincss.inputfield}>
            <div className={signincss.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Enter your password</label>
              <span
                className={signincss.passwordIcon}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className={signincss.forget}>
            <label className={signincss.rememberLabel}>
              <input type="checkbox" className={signincss.remember} />
              <span>Remember me</span>
            </label>
            <Link to="/Forgotpassword">Forgot password?</Link>
          </div>

          {/* Login Button */}
          <button className={signincss.login} type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
