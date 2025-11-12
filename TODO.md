# OTP Authentication Implementation

## Backend Changes
- [ ] Add email OTP functionality using nodemailer
- [ ] Modify login endpoint to send OTP instead of direct authentication
- [ ] Update registration schemas to include phone numbers
- [ ] Add OTP verification step to login flow

## Frontend Changes
- [ ] Update Auth.tsx to include login form with OTP verification flow
- [ ] Update AuthContext to handle multi-step OTP login
- [ ] Add OTP input components to registration forms
- [ ] Update registration forms to collect phone numbers

## Testing
- [ ] Test complete login flow with OTP for creators
- [ ] Test complete login flow with OTP for brands
- [ ] Test phone verification during registration
- [ ] Test email OTP option

## Database/Environment
- [ ] Ensure database schema supports OTP fields (already done)
- [ ] Add email service configuration (nodemailer)
