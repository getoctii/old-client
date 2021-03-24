import { Redirect, Switch, useHistory, useRouteMatch } from "react-router-dom";
import { useMedia } from "react-use";
import styles from "../Organization.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/pro-solid-svg-icons";
import Navbar from "./Navbar";
import React, { Suspense } from "react";
import { PrivateRoute } from "../../../authentication/PrivateRoute";
import Products from "../Products";
import Settings from "../Settings";

const Product = () => {
  const { path } = useRouteMatch()
  const history = useHistory()
  const isMobile = useMedia('(max-width: 740px)')
  return (
    <div className={styles.orgnaization}>
      <div className={styles.header}>
        {isMobile ? (
          <div
            className={styles.icon}
            onClick={() => isMobile && history.push(`/developer`)}
          >
            <FontAwesomeIcon
              className={styles.backButton}
              icon={faChevronLeft}
            />
          </div>
        ) : (
          <div
            className={styles.icon}
            style={{
              backgroundImage: `url('https://file.coffee/u/fGpSBEutgA.png')`
            }}
          />
        )}
        <div className={styles.title}>
          <small>Product</small>
          <h2>sex</h2>
        </div>
      </div>
      <Navbar.View />
      {/*<Suspense fallback={<></>}>*/}
      {/*  <Switch>*/}
      {/*    {!isMobile && <Redirect path={path} to={`${path}/products`} exact />}*/}
      {/*    <PrivateRoute path={`${path}/products`} component={Products} exact />*/}
      {/*    <PrivateRoute component={Settings} path={`${path}/settings`} exact />*/}
      {/*  </Switch>*/}
      {/*</Suspense>*/}
    </div>
  )
}

export default Product