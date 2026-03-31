import React from "react";
import { View } from "react-native";

import SimpleLogo from "@/components/SimpleLogo";
import TermsAndPrivacy from "@/components/TermsAndPrivacy";
import { AuthFormContainer } from "@/core/auth/components/AuthFormContainer";
import Header from "@/core/auth/components/Header";
import { authStyles } from "@/core/auth/styles/authStyles";
import { useTranslation } from "react-i18next";
import SignUpForm from "@/core/auth/components/SignUpForm";

const SignUp = () => {
  const { t } = useTranslation();

  return (
    <AuthFormContainer showTopSpacing={false}>
      <View style={authStyles.smallLogoContainer}>
        <SimpleLogo />
      </View>

      <Header
        title={t("signUpScreenTitle")}
        link={"/login"}
        linkText={t("signIn")}
        subtitle={t("alreadyHaveAccount")}
      />

      <SignUpForm />

      <TermsAndPrivacy />
    </AuthFormContainer>
  );
};

export default SignUp;
