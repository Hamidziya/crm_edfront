import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AxiosService from "../../components/utils/ApiService";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Signupcss from "./signup.module.css";
import Spinner from "../../components/utils/Sipnners"; // Replace with the correct path to your Spinner component

function Signup() {
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const navigate = useNavigate();

  const handleSignup = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);

      const response = await AxiosService.post("/user/signup", values);
      console.log(response.data.message);
      toast.success(response.data.message);
      navigate("/");
    } catch (error) {
      console.error(error.response.data.message);
      toast.error(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: handleSignup,
  });

  return (
    <>
      <div className={Signupcss.totalbody}>
        <div className={Signupcss.circles}>
          <div className={Signupcss.circle1}></div>
          <div className={Signupcss.circle2}></div>
        </div>
        <form onSubmit={formik.handleSubmit} className={Signupcss.login_form}>
          <h1>Welcome back!</h1>
          <p>Signup to your account.</p>
          <input
            type="text"
            name="firstName"
            className={Signupcss.formcontrol}
            placeholder="First Name"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.firstName && formik.errors.firstName && (
            <p className={Signupcss.error}>{formik.errors.firstName}</p>
          )}

          <input
            type="text"
            name="lastName"
            className={Signupcss.formcontrol}
            placeholder="Last Name"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.lastName && formik.errors.lastName && (
            <p className={Signupcss.error}>{formik.errors.lastName}</p>
          )}

          <input
            type="email"
            name="email"
            className={Signupcss.formcontrol}
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <p className={Signupcss.error}>{formik.errors.email}</p>
          )}

          <input
            type="password"
            name="password"
            className={Signupcss.formcontrol}
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.password && formik.errors.password && (
            <p className={Signupcss.error}>{formik.errors.password}</p>
          )}

          <button type="submit" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <Spinner /> : "Signup"}
          </button>

          {/* Login Link */}
          <p>
            Already have an account?{" "}
            <Link to="/" className={Signupcss.signuptext}>
              Login
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}

export default Signup;
