import React from 'react'
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik'
import styles from './shared.module.scss'
import { isEmail, isPassword, isUsername } from './validations'
import { useMutation } from 'react-query'
import { register } from '../remote'
import { BarLoader } from 'react-spinners'
import { Auth } from '../state'

type formData = { email: string; password: string; username: string }

const validate = (values: formData) => {
	const errors: { email?: string; password?: string; username?: string } = {}
	if (!isEmail(values.email)) errors.email = 'A valid email is required'
	if (!isPassword(values.password))
		errors.password = 'A valid password is required'
	if (!isUsername(values.username))
		errors.username = 'A valid username is required'
	return errors
}

export const Register = () => {
	const [mutate] = useMutation(register)
	const auth = Auth.useContainer()

	const submit = async (
		values: formData,
		{ setSubmitting }: FormikHelpers<formData>
	) => {
		try {
			const response = await mutate(values)
			console.log(response)
			localStorage.setItem('neko-token', response.authorization)
			auth.setToken(response.authorization)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<Formik
			initialValues={{ email: '', password: '', username: '' }}
			validate={validate}
			onSubmit={submit}
		>
			{({ isSubmitting }) => (
				<Form>
					<label htmlFor="email" className={styles.label}>
						Email
					</label>
					<Field
						className={styles.input}
						id="email"
						name="email"
						type="email"
					/>
					<ErrorMessage component="p" className={styles.error} name="email" />

					<label htmlFor="username" className={styles.label}>
						Username
					</label>
					<Field
						className={styles.input}
						id="username"
						name="username"
						type="text"
					/>
					<ErrorMessage
						component="p"
						className={styles.error}
						name="username"
					/>

					<label htmlFor="password" className={styles.label}>
						Password
					</label>
					<Field
						className={styles.input}
						id="password"
						name="password"
						type="password"
					/>
					<ErrorMessage
						component="p"
						className={styles.error}
						name="password"
					/>
					{/*TODO: Currently at #ffffff for testing, add theming support*/}
					<button
						className={styles.button}
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? <BarLoader color="#ffffff" /> : 'Register'}
					</button>
				</Form>
			)}
		</Formik>
	)
}
