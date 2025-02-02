'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import { useDispatch } from 'react-redux'

import { setCookie } from 'cookies-next'

import type { SystemMode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { setUserType } from '@/redux-store/slices/auth'
import { authService } from '@/apis/services/auth'

// Auth Service Import

// Styled Components remain the same
const LoginIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 680,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: {
    maxBlockSize: 550
  },
  [theme.breakpoints.down('lg')]: {
    maxBlockSize: 450
  }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 355,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const LoginV2 = ({ mode }: { mode: SystemMode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('admin@medex.net')
  const [password, setPassword] = useState('P@ssw0rd')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedUserType, setSelectedUserType] = useState<'admin' | 'doctor' | 'hospital'>('admin')

  const dispatch = useDispatch()

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const userType = e.target.value as 'admin' | 'doctor' | 'hospital'

    setSelectedUserType(userType)
    dispatch(setUserType(userType))
  }

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await authService.login({
        email,
        password
      })

      // Store the token in cookies
      setCookie('userToken', response.data.data._token, {
        maxAge: 24 * 60 * 60, // 1 day
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      })

      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <LoginIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && (
          <MaskImg
            alt='mask'
            src={authBackground}
            className={classnames({ 'scale-x-[-1]': theme.direction === 'rtl' })}
          />
        )}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-11 sm:mbs-14 md:mbs-0'>
          <div className='flex flex-col gap-1'>
            <Typography variant='h4'>{`Welcome to ${themeConfig.templateName}! 👋🏻`}</Typography>
            <Typography>Please sign-in to your account and start the adventure</Typography>
          </div>
          {error && (
            <Typography color='error' variant='body2'>
              {error}
            </Typography>
          )}
          <form noValidate autoComplete='off' onSubmit={handleLogin} className='flex flex-col gap-5'>
            <CustomTextField
              autoFocus
              fullWidth
              label='Email or Username'
              placeholder='Enter your email or username'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <CustomTextField
              fullWidth
              label='Password'
              placeholder='············'
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={isPasswordShown ? 'text' : 'password'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton edge='end' onClick={handleClickShowPassword} onMouseDown={e => e.preventDefault()}>
                        <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <Button fullWidth variant='contained' type='submit' disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <div className='flex gap-4 items-center'>
              <div className='flex items-center gap-2'>
                <input
                  type='radio'
                  id='admin'
                  name='userType'
                  value='admin'
                  checked={selectedUserType === 'admin'}
                  onChange={handleUserTypeChange}
                />
                <label htmlFor='admin'>Admin</label>
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='radio'
                  id='doctor'
                  name='userType'
                  value='doctor'
                  checked={selectedUserType === 'doctor'}
                  onChange={handleUserTypeChange}
                />
                <label htmlFor='doctor'>Doctor</label>
              </div>

              <div className='flex items-center gap-2'>
                <input
                  type='radio'
                  id='hospital'
                  name='userType'
                  value='hospital'
                  checked={selectedUserType === 'hospital'}
                  onChange={handleUserTypeChange}
                />
                <label htmlFor='hospital'>Hospital</label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
