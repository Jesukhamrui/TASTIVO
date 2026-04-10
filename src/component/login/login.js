import React, { useEffect, useRef, useState } from "react";
import '../register/register.css'
import { useHistory } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000";

function Login(){
   const OTP_LENGTH = 6
   const [loginMode,setLoginMode] = useState('password')
   const [loginName,setLoginName]=useState('')
   const [loginPassword,setLoginPassword]=useState('')
   const [newPassword,setNewPassword]=useState('')
   const [otpDigits,setOtpDigits]=useState(Array(OTP_LENGTH).fill(''))
   const [resetStep,setResetStep]=useState(1)
   const [resetToken,setResetToken]=useState('')
   const [loginNameErr,setLoginNameErr]=useState(false)
   const [loginPasswordErr,setPasswordErr]=useState(false)
   const [newPasswordErr,setNewPasswordErr]=useState(false)
   const [loginCodeErr,setLoginCodeErr]=useState(false)
   const [status,setStatus]=useState({ type: '', text: '' })
   const [loading,setLoading] = useState(false)
   const [sendingCode,setSendingCode] = useState(false)
   const [codeSent,setCodeSent] = useState(false)
   const [resendSeconds,setResendSeconds] = useState(0)
   const otpInputRefs = useRef([])
   const history=useHistory()

   const loginCode = otpDigits.join('')

   useEffect(() => {
      if (resendSeconds <= 0) return;
      const timer = setTimeout(() => {
         setResendSeconds(prev => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
   }, [resendSeconds])

   useEffect(() => {
      if (loginMode === 'code' || (loginMode === 'reset' && resetStep === 2)) {
         setTimeout(() => {
            if (otpInputRefs.current[0]) {
               otpInputRefs.current[0].focus()
            }
         }, 0)
      }
   }, [loginMode, resetStep])

   function resetErrorState() {
      setLoginNameErr(false)
      setPasswordErr(false)
      setNewPasswordErr(false)
      setLoginCodeErr(false)
   }

   function setErrorMessage(text) {
      setStatus({ type: 'error', text })
   }

   function setSuccessMessage(text) {
      setStatus({ type: 'success', text })
   }

   function clearStatusMessage() {
      setStatus({ type: '', text: '' })
   }

   function resetOtpInputs() {
      setOtpDigits(Array(OTP_LENGTH).fill(''))
   }

   function switchMode(mode) {
      setLoginMode(mode)
      setLoginPassword('')
      setNewPassword('')
      resetOtpInputs()
      setResetStep(1)
      setResetToken('')
      setCodeSent(false)
      setResendSeconds(0)
      clearStatusMessage()
      resetErrorState()
   }

   function startForgotPasswordFlow() {
      switchMode('reset')
      setStatus({ type: 'success', text: 'Enter your email and request a reset code.' })
   }

   function onOtpInputChange(index, value) {
      const numericValue = value.replace(/\D/g, '')
      if (!numericValue) {
         const nextDigits = [...otpDigits]
         nextDigits[index] = ''
         setOtpDigits(nextDigits)
         return
      }

      const nextDigits = [...otpDigits]
      nextDigits[index] = numericValue.slice(-1)
      setOtpDigits(nextDigits)
      setLoginCodeErr(false)

      if (index < OTP_LENGTH - 1 && otpInputRefs.current[index + 1]) {
         otpInputRefs.current[index + 1].focus()
      }
   }

   function onOtpKeyDown(index, event) {
      if (event.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputRefs.current[index - 1]) {
         otpInputRefs.current[index - 1].focus()
      }
   }

   function onOtpPaste(event) {
      const pastedText = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
      if (!pastedText) return

      event.preventDefault()

      const nextDigits = Array(OTP_LENGTH).fill('')
      pastedText.split('').forEach((digit, idx) => {
         nextDigits[idx] = digit
      })
      setOtpDigits(nextDigits)

      const focusIndex = Math.min(pastedText.length, OTP_LENGTH) - 1
      if (focusIndex >= 0 && otpInputRefs.current[focusIndex]) {
         otpInputRefs.current[focusIndex].focus()
      }
   }

   async function requestLoginCode() {
      clearStatusMessage()
      setLoginNameErr(false)

      if(resendSeconds > 0){
         return;
      }

      if(loginName.trim().length===0){
         setLoginNameErr(true)
         return;
      }

      try {
         setSendingCode(true)
         const endpoint = loginMode === 'reset'
            ? `${API_BASE_URL}/api/auth/password-reset/request-code`
            : `${API_BASE_URL}/api/auth/login/email/request-code`

         const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: loginName,
            }),
         })

         const data = await response.json().catch(() => ({}))
         if (!response.ok) {
            setErrorMessage(data.error || 'Unable to send code')
            return
         }

         setCodeSent(true)
         setResendSeconds(60)
         resetOtpInputs()

         if (loginMode === 'reset') {
            setResetStep(2)
            setSuccessMessage('Reset code sent. Enter the 6-digit code from your email.')
         } else {
            setSuccessMessage(data.message || 'Code sent to your email')
         }

         setTimeout(() => {
            if (otpInputRefs.current[0]) {
               otpInputRefs.current[0].focus()
            }
         }, 0)
      } catch (error) {
         console.error('Request code failed', error)
         setErrorMessage('Unable to send code right now')
      } finally {
         setSendingCode(false)
      }
   }

   async function verifyResetCode(event) {
      if (event) {
         event.preventDefault()
      }

      resetErrorState()
      clearStatusMessage()

      if (loginName.trim().length === 0) {
         setLoginNameErr(true)
      }

      if (loginCode.trim().length !== OTP_LENGTH) {
         setLoginCodeErr(true)
      }

      if (loginName.trim().length === 0 || loginCode.trim().length !== OTP_LENGTH) {
         return
      }

      try {
         setLoading(true)
         const response = await fetch(`${API_BASE_URL}/api/auth/password-reset/verify-code`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: loginName,
               code: loginCode,
            }),
         })

         const data = await response.json().catch(() => ({}))
         if (!response.ok) {
            setErrorMessage(data.error || 'Unable to verify code')
            return
         }

         setResetToken(data.resetToken || '')
         setResetStep(3)
         resetOtpInputs()
         setResendSeconds(0)
         setSuccessMessage('Code verified. Set your new password.')
      } catch (error) {
         console.error('Verify reset code failed', error)
         setErrorMessage('Unable to verify code right now')
      } finally {
         setLoading(false)
      }
   }

   async function submitNewPassword(event) {
      if (event) {
         event.preventDefault()
      }

      resetErrorState()
      clearStatusMessage()

      if (loginName.trim().length === 0) {
         setLoginNameErr(true)
      }

      if (newPassword.trim().length < 6) {
         setNewPasswordErr(true)
      }

      if (loginName.trim().length === 0 || newPassword.trim().length < 6 || !resetToken) {
         return
      }

      try {
         setLoading(true)
         const response = await fetch(`${API_BASE_URL}/api/auth/password-reset/confirm`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               email: loginName,
               resetToken,
               newPassword,
            }),
         })

         const data = await response.json().catch(() => ({}))
         if (!response.ok) {
            setErrorMessage(data.error || 'Unable to reset password')
            return
         }

         switchMode('password')
         setSuccessMessage('Password reset successful. Please login with your new password.')
      } catch (error) {
         console.error('Reset password failed', error)
         setErrorMessage('Unable to reset password right now')
      } finally {
         setLoading(false)
      }
   }

   async function Loginvalidation(event) {
      if (event) {
         event.preventDefault()
      }

      if (loginMode === 'reset') {
         if (resetStep === 2) {
            await verifyResetCode()
         } else if (resetStep === 3) {
            await submitNewPassword()
         }
         return
      }

      resetErrorState()
      clearStatusMessage()

      if(loginName.trim().length!==0){
         setLoginNameErr(false)
      }
      else { 
         setLoginNameErr(true)
      }

      if(loginMode === 'password') {
         if(loginPassword.trim().length!==0){
            setPasswordErr(false)
         }
         else { 
            setPasswordErr(true)
         }
      } else {
         if(loginCode.trim().length!==0){
            setLoginCodeErr(false)
         }
         else {
            setLoginCodeErr(true)
         }
      }

      if(loginMode === 'password' && (loginName.trim().length===0 || loginPassword.trim().length===0)){
         return;
      }

      if(loginMode === 'code' && (loginName.trim().length===0 || loginCode.trim().length===0)){
         return;
      }

      try {
         setLoading(true);
         clearStatusMessage();

         const endpoint = loginMode === 'password'
            ? `${API_BASE_URL}/api/auth/login`
            : `${API_BASE_URL}/api/auth/login/email/verify-code`;

         const payload = loginMode === 'password'
            ? {
               email: loginName,
               password: loginPassword,
            }
            : {
               email: loginName,
               code: loginCode,
            };

         const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
         });

         const data = await response.json().catch(() => ({}));
         if (!response.ok) {
            setErrorMessage(data.error || 'Login failed');
            return;
         }

         if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
         }

         history.push('/home');
      } catch (error) {
         console.error('Login failed', error);
         setErrorMessage('Login failed');
      } finally {
         setLoading(false);
      }
   }
   return(
      <div className="login-body">
         <form className="login-main" onSubmit={Loginvalidation}>
            <h1>{loginMode === 'reset' ? 'Reset Password' : 'Login'}</h1>
            <div style={{display:'flex',gap:'8px',justifyContent:'center',marginBottom:'10px',flexWrap:'wrap'}}>
               <button type='button' onClick={() => switchMode('password')} disabled={loading || sendingCode}>
                  Password Login
               </button>
               <button type='button' onClick={() => switchMode('code')} disabled={loading || sendingCode}>
                  Email Code Login
               </button>
               <button type='button' onClick={startForgotPasswordFlow} disabled={loading || sendingCode}>
                  Forgot Password
               </button>
            </div>
            {status.text && (
               <small
                  role="status"
                  aria-live="polite"
                  style={{color: status.type === 'error' ? 'red' : '#1a7f37',textAlign:'center',marginBottom:'6px'}}
               >
                  {status.text}
               </small>
            )}
            <br />
            <p>Email</p>
            <input
               type='email'
               inputMode='email'
               autoComplete='email'
               autoCapitalize='none'
               spellCheck={false}
               value={loginName}
               onChange={(e)=>{setLoginName(e.target.value); setLoginNameErr(false); clearStatusMessage();}}
            ></input>
            {loginNameErr&& <small  style={{color:'#d3521d'}}>Please enter the Username</small>}
            <br />
            {loginMode === 'password' && (
               <>
                  <p>Password</p>
                  <input
                     type='password'
                     autoComplete='current-password'
                     value={loginPassword}
                     onChange={(e)=>{setLoginPassword(e.target.value); setPasswordErr(false); clearStatusMessage();}}
                  ></input>
                  {loginPasswordErr&& <small  style={{color:'#d3521d'}}>Please enter the password </small>}
                  <button type='button' className='auth-link-btn' onClick={startForgotPasswordFlow}>
                     Forgot password?
                  </button>
               </>
            )}
            {loginMode === 'code' && (
               <>
                  <p>One-Time Code</p>
                  <div className="otp-grid" onPaste={onOtpPaste}>
                     {otpDigits.map((digit, index) => (
                        <input
                           key={index}
                           ref={(el) => { otpInputRefs.current[index] = el }}
                           type='text'
                           inputMode='numeric'
                           pattern='[0-9]*'
                           maxLength={1}
                           className='otp-input'
                           value={digit}
                           onChange={(e) => onOtpInputChange(index, e.target.value)}
                           onKeyDown={(e) => onOtpKeyDown(index, e)}
                           aria-label={`OTP digit ${index + 1}`}
                        />
                     ))}
                  </div>
                  {loginCodeErr&& <small  style={{color:'#d3521d'}}>Please enter the login code</small>}
                  <br />
                  <button type='button' onClick={requestLoginCode} disabled={sendingCode || loading || resendSeconds > 0}>
                     {sendingCode
                        ? 'Sending code...'
                        : (codeSent
                           ? (resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend code')
                           : 'Send code')}
                  </button>
               </>
            )}
            {loginMode === 'reset' && (
               <>
                  <p style={{lineHeight:'20px',marginTop:'10px'}}>
                     {resetStep === 1 && 'Step 1: Request reset code'}
                     {resetStep === 2 && 'Step 2: Verify reset code'}
                     {resetStep === 3 && 'Step 3: Set new password'}
                  </p>

                  {resetStep === 1 && (
                     <button type='button' onClick={requestLoginCode} disabled={sendingCode || loading || resendSeconds > 0}>
                        {sendingCode
                           ? 'Sending code...'
                           : (codeSent
                              ? (resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend code')
                              : 'Send reset code')}
                     </button>
                  )}

                  {resetStep === 2 && (
                     <>
                        <p>Enter Reset Code</p>
                        <div className="otp-grid" onPaste={onOtpPaste}>
                           {otpDigits.map((digit, index) => (
                              <input
                                 key={index}
                                 ref={(el) => { otpInputRefs.current[index] = el }}
                                 type='text'
                                 inputMode='numeric'
                                 pattern='[0-9]*'
                                 maxLength={1}
                                 className='otp-input'
                                 value={digit}
                                 onChange={(e) => onOtpInputChange(index, e.target.value)}
                                 onKeyDown={(e) => onOtpKeyDown(index, e)}
                                 aria-label={`Reset code digit ${index + 1}`}
                              />
                           ))}
                        </div>
                        {loginCodeErr&& <small  style={{color:'#d3521d'}}>Please enter all 6 digits</small>}
                        <button type='button' onClick={requestLoginCode} disabled={sendingCode || loading || resendSeconds > 0}>
                           {sendingCode
                              ? 'Sending code...'
                              : (resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend code')}
                        </button>
                        <button type='submit' disabled={loading}>{loading ? 'Verifying...' : 'Verify Code'}</button>
                     </>
                  )}

                  {resetStep === 3 && (
                     <>
                        <p>New Password</p>
                        <input
                           type='password'
                           autoComplete='new-password'
                           value={newPassword}
                           onChange={(e)=>{setNewPassword(e.target.value); setNewPasswordErr(false); clearStatusMessage();}}
                        ></input>
                        {newPasswordErr&& <small  style={{color:'#d3521d'}}>Password must be at least 6 characters</small>}
                        <button type='submit' disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
                     </>
                  )}

                  <button type='button' className='auth-link-btn' onClick={() => switchMode('password')}>
                     Back to password login
                  </button>
               </>
            )}
            <br />
            {loginMode !== 'reset' && <button type='submit' disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>}
            <br />
            <a href="/register" style={{marginTop:'10px',display:'inline-block'}}>Doesn't have an account yet? Sign up</a>
         </form>
      </div>
   )
}
export default Login