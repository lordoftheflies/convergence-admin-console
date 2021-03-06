/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence Server, which is released under
 * the terms of the GNU General Public License version 3 (GPLv3). A copy
 * of the GPLv3 should have been provided along with this file, typically
 * located in the "LICENSE" file, which is part of this source code package.
 * Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> for the
 * full text of the GPLv3 license, if it was not provided.
 */

import React, {Component, FormEvent, ReactNode} from 'react';
import {Redirect, RouteComponentProps} from "react-router";
import {Button, Checkbox, Form, Icon, Input,} from 'antd';
import {FormComponentProps} from 'antd/lib/form/Form';
import styles from "./styles.module.css";
import logo from "../../../assets/images/logo.png";
import {AuthService} from "../../../services/AuthService";
import {AuthStore} from "../../../stores/AuthStore";
import {localStorageService} from "../../../services/LocalStorageService";
import {injectAs} from "../../../utils/mobx-utils";
import {STORES} from "../../../stores/StoreConstants";
import {SERVICES} from "../../../services/ServiceConstants";
import {LoggedInUserService} from "../../../services/LoggedInUserService";
import {ProfileStore} from "../../../stores/ProfileStore";
import {FormCreateOption} from "antd/es/form";

export interface InjectedProps extends RouteComponentProps, FormComponentProps {
  authStore: AuthStore;
  authService: AuthService;
  loggedInUserService: LoggedInUserService;
  profileStore: ProfileStore;
}

export interface LoginFormState {
  redirectToReferrer: boolean;
  errorMessage: string | null;

}

class NormalLoginForm extends Component<InjectedProps, LoginFormState> {
  state = {
    redirectToReferrer: false,
    errorMessage: null
  };

  handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const {username, password} = values;
        this.props.authService.login(username, password)
          .then(resp => {
            const {token, expiresIn} = resp;
            const expiresAt = new Date(Date.now() + expiresIn).getTime();
            this.props.authStore.setAuthenticated(resp.token);
            localStorageService.setAuthToken({token, expiresAt});
            return this.props.loggedInUserService.getProfile();
          })
          .then((profile) => {
            this.props.profileStore.setProfile(profile);
            this.setState({
              redirectToReferrer: true,
              errorMessage: null
            });
          })
          .catch(err => {
            console.log(err);
            this.setState({
              errorMessage: "Invalid credentials"
            })
          });
      }
    });
  }

  render(): ReactNode {
    let {from} = this.props.location.state || {from: {pathname: "/"}};
    if (from.pathname === "/login") {
      from = {pathname: "/"};
    }
    const {redirectToReferrer} = this.state;

    if (redirectToReferrer) {
      return <Redirect to={from}/>;
    }

    const {getFieldDecorator} = this.props.form;

    const error = this.state.errorMessage ?
      <div className={styles.error}><Icon type="warning"/>{this.state.errorMessage}</div> :
      null;

    return (
      <div className={styles.loginContainer}>
        <div className={styles.header}>
          <img alt="Convergence Logo" className={styles.logo} src={logo}/>
          <div className={styles.title}>Convergence</div>
        </div>
        <Form onSubmit={this.handleSubmit} className={styles.loginForm}>
          <Form.Item>
            {getFieldDecorator('username', {
              rules: [{required: true, message: 'Please input your username!'}],
            })(
              <Input prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>} placeholder="Username"/>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('password', {
              rules: [{required: true, message: 'Please input your Password!'}],
            })(
              <Input prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>} type="password"
                     placeholder="Password"/>
            )}
          </Form.Item>
          {error}
          <Form.Item>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox>Remember me</Checkbox>
            )}
            <Button type="primary" htmlType="submit" className={styles.loginFormButton}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const injections = [STORES.AUTH_STORE, STORES.PROFILE_STORE, SERVICES.AUTH_SERVICE, SERVICES.LOGGED_IN_USER_SERVICE];
const formOptions: FormCreateOption<InjectedProps> = {};
export const LoginForm = injectAs<RouteComponentProps>(injections, Form.create(formOptions)(NormalLoginForm));
