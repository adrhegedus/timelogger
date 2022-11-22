import React from "react"
import { Link } from "react-router-dom"

import { Check2Circle, FilesAlt, House } from "react-bootstrap-icons"
import { Container, Navbar as BSNavbar } from "react-bootstrap"

import styles from "./Navbar.module.scss"
import classNames from "classnames/bind"
const cx = classNames.bind(styles)

/** A navigation panel component. */
const Navbar = () => (
	<BSNavbar bg="dark" expand="md" id={cx("navbar")}>
		<Container>
			<Link to="/"><House/>Home</Link>
			<Link to="/projects"><FilesAlt/>Projects</Link>
			<Link to="/tasks"><Check2Circle/>Tasks</Link>
		</Container>
	</BSNavbar>
)

export default Navbar