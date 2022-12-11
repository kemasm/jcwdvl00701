import React from "react";

import {
    Flex,
    Spacer,
    Image,
    Box,
    Heading,
    FormControl,
    FormErrorMessage,
    Input,
    Button,
    Text,
    InputGroup,
    InputRightElement,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    CloseButton,
    FormHelperText,
} from "@chakra-ui/react";
import turuIcon from "../../Assets/image/turuIcon.png";
import google from "../../Assets/image/google.png";
import facebook from "../../Assets/image/facebook.png";
import registerImage from "../../Assets/image/registerImage.png";
import Footer from "../../Components/Footer";
import {Link, useHistory} from "react-router-dom";
import {useFormik} from "formik";
import * as Yup from "yup";
import YupPassword from "yup-password";
import "yup-phone";
import {authFirebase} from "../../Config/firebase";
import {
    createUserWithEmailAndPassword,
    getAuth,
    sendEmailVerification,
    GoogleAuthProvider,
    signInWithPopup,
    FacebookAuthProvider,
    onAuthStateChanged,
    signInWithPhoneNumber,
} from "firebase/auth";
import axios from "axios";
import auth_types from "../../Redux/Reducers/Types/userTypes";
import {useDispatch, useSelector} from "react-redux";
import {current} from "@reduxjs/toolkit";

function RegisterUser() {
    const dispatch = useDispatch();
    let history = useHistory();

    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const handleWithGoogle = async () => {
        const providerGoogle = new GoogleAuthProvider();

        try {
            // masuk lewat google
            const userWithGoogle = await signInWithPopup(authFirebase, providerGoogle)
            // info user
            var userGoogle = (await userWithGoogle).user
            var providerIdGoogle = userWithGoogle.providerId

        } catch (error) {
            console.error(error.message)
        }

        // endpoinnt utk register user
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/register`, {
            id: userGoogle.uid,
            name: userGoogle.displayName,
            email: userGoogle.email,
            isVerified: userGoogle.emailVerified,
            firebaseProviderId: providerIdGoogle
        })
            .then(async (res) => {
                //utk get data sesuai yg masuk
                await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/get-by-id`, {
                    params: {
                        id: userGoogle.uid,
                    }
                })
                    .then((res) => {
                        console.log(res.data.result)
                        dispatch({
                            type: auth_types.Register,
                            payload: res.data.result
                        })
                        // di arahkan ke home
                        history.push("/")
                    })
                    .catch((err) => {
                        console.error(err.message)
                    })
            })
            .catch((err) => {
                console.error(err.message);
            })
    }

    const handleWithFacebook = async () => {
        const providerFacebook = new FacebookAuthProvider();

        try {
            // masuk lewat facebook
            const userWithFacebook = await signInWithPopup(authFirebase, providerFacebook)
            // console.log("info keseluruhan Facebook : ", userWithFacebook);
            // info user
            var userFacebook = await userWithFacebook.user
            sendEmailVerification(userFacebook)
                .then((res) => {
                    alert("Please check your email verification")
                })
                .catch((err) => {
                    console.error("err send email :", err.message)
                })

            var providerIdFacebook = await userWithFacebook.providerId

        } catch (error) {
            console.error(error)
        }
        // endpoinnt utk register user
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/register`, {
            id: userFacebook.uid,
            name: userFacebook.displayName,
            email: userFacebook.email,
            isVerified: userFacebook.emailVerified,
            firebaseProviderId: providerIdFacebook
        })
            .then(async (res) => {
                alert(res.message)
                //utk get data sesuai yg masuk
                await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user/get-by-id`, {
                    params: {
                        id: userFacebook.uid,
                        email: userFacebook.email,
                    }
                })
                    .then((res) => {
                        console.log(res.data.results)
                        dispatch({
                            type: auth_types.Register,
                            payload: res.data.result
                        })
                        // di arahkan ke home
                        history.push("/")
                    })
                    .catch((err) => {
                        console.error(err.message)
                    })
            })
            .catch((err) => {
                console.error(err.message);
            })

    }

    YupPassword(Yup)
    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: ""
        },
        validationSchema: Yup.object().shape({
            email: Yup.string().required("your email is invalid").email("format yang dimasukan bukan email"),
            phoneNumber: Yup.string().phone("ID").required(),
            password: Yup.string().required("please fill in the password").min(8).minUppercase(1).minNumbers(1),
            confirmPassword: Yup.string().required("please re-type your password")
                .oneOf([Yup.ref('password'), null], 'Didn\'t match with password')
        }),
        validateOnChange: false,
        onSubmit: async (values) => {
            const {name, email, phoneNumber, password} = values

            // make user use firebase
            const userCredential = await createUserWithEmailAndPassword(authFirebase, email, password)
            const user = userCredential.user
            sendEmailVerification(user)
                .then((res) => {
                    alert("Please check your email verification")
                })
                .catch((err) => {
                    console.error("err send email :", err.message)
                })

            // endpoinnt utk register user ==> belum dibuat
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/user/register`, {
                id: user.uid,
                name,
                email,
                phoneNumber,
                firebaseProviderId: "password"
            })

            alert("account have been register")

            dispatch({
                type: auth_types.Register,
                payload: response.data.result
            })
            // akan dikirim ke home tapi berstatus belum terverifikasi
            history.push("/")
        }
    });
    return (
        <Flex flexDirection="column">
            {/* flex container utk dekstop */}
            <Flex>
                {/* utk image dekstop */}
                <Flex>
                    <Image
                        display={{
                            sm: "none",
                            md: "block",
                        }}
                        src={registerImage}
                        width="900px"
                        height="1080px"
                    />
                </Flex>

                {/* Form */}
                <Flex ml={{ss: "1em", sm: "6em", md: "7em", lg: "9em"}} my="3em">
                    <Box width="360px" height="297px">
                        <Flex
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            pt="19px"
                            pb="10px"
                        >
                            <Image
                                src={turuIcon}
                                alt="turu-icon"
                                width="59px"
                                height="58px"
                            />
                            <Heading as="h1" size="md" m="10px">
                                Join Turu
                            </Heading>
                            <Flex w="184px" h="37px" justifyContent="center">
                                <Text
                                    fontSize="12px"
                                    lineHeight="15.6px"
                                    fontWeight="300"
                                    textAlign="center"
                                    mr="5px"
                                >
                                    Already have an acount?
                                </Text>
                                <Text
                                    fontSize="12px"
                                    lineHeight="15.6px"
                                    fontWeight="300"
                                    textAlign="center"
                                    _hover={{textDecoration: "underline", fontWeight: "bold"}}
                                    cursor="pointer"
                                >
                                    <Link to="login">Login</Link>
                                </Text>
                            </Flex>
                        </Flex>
                        <Flex justifyContent="center" alignItems="center">
                            <Box width="320px" height="427px">
                                <Flex flexDirection="column" alignItems="center">
                                    <FormControl id="name" pb="12px">
                                        <Input
                                            type="text"
                                            placeholder="Name"
                                            borderRadius="0"
                                            onChange={(e) =>
                                                formik.setFieldValue("name", e.target.value)
                                            }
                                        />
                                    </FormControl>
                                    <FormControl id="email" pb="12px">
                                        <Input
                                            type="email"
                                            placeholder="Email"
                                            borderRadius="0"
                                            onChange={(e) =>
                                                formik.setFieldValue("email", e.target.value)
                                            }
                                        />
                                        {formik.errors.email ? (
                                            <FormHelperText color="red" textAlign="center">
                                                {formik.errors.email}
                                            </FormHelperText>
                                        ) : null}
                                    </FormControl>
                                    <FormControl id="phoneNumber" pb="12px">
                                        <Input
                                            type="text"
                                            placeholder="Phone number"
                                            borderRadius="0"
                                            onChange={(e) =>
                                                formik.setFieldValue("phoneNumber", e.target.value)
                                            }
                                        />
                                        {formik.errors.phoneNumber ? (
                                            <FormHelperText color="red" textAlign="center">
                                                {formik.errors.phoneNumber}
                                            </FormHelperText>
                                        ) : null}
                                    </FormControl>
                                    <FormControl id="password" pb="12px">
                                        <InputGroup>
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                borderRadius="0"
                                                onChange={(e) =>
                                                    formik.setFieldValue("password", e.target.value)
                                                }
                                            />
                                            <InputRightElement>
                                                <Button onClick={() => setShowPassword(current => !current)}>
                                                    {showPassword ? (
                                                        <i className="fa-sharp fa-solid fa-eye"></i>
                                                    ) : (
                                                        <i className="fa-solid fa-eye-slash"></i>
                                                    )}
                                                </Button>
                                            </InputRightElement>
                                        </InputGroup>
                                        {formik.errors.password ? (
                                            <FormHelperText color="red" textAlign="center">
                                                {formik.errors.password}
                                            </FormHelperText>
                                        ) : null}
                                    </FormControl>
                                    <FormControl id="confirmPassword" pb="12px">
                                        <InputGroup>
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm Password"
                                                borderRadius="0"
                                                onChange={(e) =>
                                                    formik.setFieldValue(
                                                        "confirmPassword",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <InputRightElement>
                                                <Button
                                                    onClick={(e) => setShowConfirmPassword(current => !current)}
                                                >
                                                    {showConfirmPassword ? (
                                                        <i className="fa-sharp fa-solid fa-eye"></i>
                                                    ) : (
                                                        <i className="fa-solid fa-eye-slash"></i>
                                                    )}
                                                </Button>
                                            </InputRightElement>
                                        </InputGroup>
                                        {formik.errors.confirmPassword ? (
                                            <FormHelperText color="red" textAlign="center">
                                                {formik.errors.confirmPassword}
                                            </FormHelperText>
                                        ) : null}
                                    </FormControl>
                                    <Button
                                        variant="primary"
                                        mb="12px"
                                        onClick={formik.handleSubmit}
                                    >
                                        Sign up
                                    </Button>
                                </Flex>
                                <Flex justifyContent="flex-end" mr="10px" mb="16px">
                                    <Text
                                        fontSize="12px"
                                        fontWeight="300"
                                        cursor="pointer"
                                        _hover={{textDecoration: "underline"}}
                                    >
                                        <Link to="/tenant/register">Sign Up as Tenant</Link>
                                    </Text>
                                </Flex>
                                <hr/>

                                <Button
                                    variant="secondary"
                                    mt="20px"
                                    onClick={handleWithGoogle}
                                >
                                    <Image src={google} mr="5px"></Image>
                                    <Text>Sign Up With Google</Text>
                                </Button>
                                <Button
                                    variant="secondary"
                                    mt="20px"
                                    onClick={handleWithFacebook}
                                >
                                    <Image src={facebook}></Image>
                                    <Text>Sign Up With Facebook</Text>
                                </Button>
                            </Box>
                        </Flex>
                    </Box>
                </Flex>
            </Flex>
            <Footer ss={"22em"} sm={"22em"} sl={"22em"}/>
        </Flex>
    );
}

export default RegisterUser;
