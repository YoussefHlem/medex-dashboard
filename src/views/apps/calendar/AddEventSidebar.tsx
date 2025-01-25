// React Imports
import { forwardRef, useCallback, useEffect, useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { Controller, useForm } from 'react-hook-form'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { AddEventSidebarType } from '@/types/apps/calendarTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Slice Imports
import { addEvent, deleteEvent, filterEvents, selectedEvent, updateEvent } from '@/redux-store/slices/calendar'
import { agendaService } from '@/apis/services/agenda'

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

interface DefaultStateType {
  title: string
  description: string
  endDate: Date
  startDate: Date
}

// Vars
const defaultState: DefaultStateType = {
  title: '',
  description: '',
  endDate: new Date(),
  startDate: new Date()
}

interface AddEventType {
  display: 'block'
  title: string
  start: Date
  end: Date
  description?: string
}

const AddEventSidebar = (props: AddEventSidebarType) => {
  // Props
  const { calendarStore, dispatch, addEventSidebarOpen, handleAddEventSidebarToggle } = props

  // States
  const [values, setValues] = useState<DefaultStateType>(defaultState)

  // Refs
  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <CustomTextField
        inputRef={ref}
        fullWidth
        {...props}
        label={props.label || ''}
        className='is-full'
        error={props.error}
      />
    )
  })

  // Hooks
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const resetToStoredValues = useCallback(() => {
    if (calendarStore.selectedEvent !== null) {
      const event = calendarStore.selectedEvent

      setValue('title', event.title || '')
      setValues({
        title: event.title || '',
        description: event.extendedProps.description || '',
        endDate: event.end !== null ? event.end : event.start,
        startDate: event.start !== null ? event.start : new Date()
      })
    }
  }, [setValue, calendarStore.selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue])

  const handleSidebarClose = () => {
    setValues(defaultState)
    clearErrors()
    dispatch(selectedEvent(null))
    handleAddEventSidebarToggle()
  }

  const onSubmit = (data: { title: string }) => {
    const modifiedEvent: AddEventType = {
      display: 'block',
      title: data.title,
      end: values.endDate,
      start: values.startDate,
      description: values.description.length ? values.description : undefined
    }

    if (
      calendarStore.selectedEvent === null ||
      (calendarStore.selectedEvent !== null && !calendarStore.selectedEvent.title.length)
    ) {
      agendaService.createAgenda(props.doctorId, modifiedEvent).then(() => {
        dispatch(addEvent(modifiedEvent))
      })
    } else {
      dispatch(updateEvent({ ...modifiedEvent, id: calendarStore.selectedEvent.id }))
    }

    dispatch(filterEvents())

    handleSidebarClose()
  }

  const handleDeleteButtonClick = () => {
    if (calendarStore.selectedEvent) {
      agendaService.deleteAgenda(calendarStore.selectedEvent.id).then(() => {
        dispatch(deleteEvent(calendarStore.selectedEvent.id))
      })
      dispatch(filterEvents())
    }

    handleSidebarClose()
  }

  const handleStartDate = (date: Date | null) => {
    if (date && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const RenderSidebarFooter = () => {
    if (
      calendarStore.selectedEvent === null ||
      (calendarStore.selectedEvent && !calendarStore.selectedEvent.title.length)
    ) {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained'>
            Add
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToEmptyValues}>
            Reset
          </Button>
        </div>
      )
    } else {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained'>
            Update
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToStoredValues}>
            Reset
          </Button>
        </div>
      )
    }
  }

  const ScrollWrapper = isBelowSmScreen ? 'div' : PerfectScrollbar

  useEffect(() => {
    if (calendarStore.selectedEvent !== null) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [addEventSidebarOpen, resetToStoredValues, resetToEmptyValues, calendarStore.selectedEvent])

  return (
    <Drawer
      anchor='right'
      open={addEventSidebarOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', 400] } }}
    >
      <Box className='flex justify-between items-center sidebar-header plb-5 pli-6 border-be'>
        <Typography variant='h5'>
          {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? 'Update Event' : 'Add Event'}
        </Typography>
        {calendarStore.selectedEvent && calendarStore.selectedEvent.title.length ? (
          <Box className='flex items-center' sx={{ gap: calendarStore.selectedEvent !== null ? 1 : 0 }}>
            {/*<IconButton size='small' onClick={handleDeleteButtonClick}>*/}
            {/*  <i className='tabler-trash text-2xl text-textPrimary' />*/}
            {/*</IconButton>*/}
            <IconButton size='small' onClick={handleSidebarClose}>
              <i className='tabler-x text-2xl text-textPrimary' />
            </IconButton>
          </Box>
        ) : (
          <IconButton size='small' onClick={handleSidebarClose}>
            <i className='tabler-x text-2xl text-textPrimary' />
          </IconButton>
        )}
      </Box>
      <ScrollWrapper
        {...(isBelowSmScreen
          ? { className: 'bs-full overflow-y-auto overflow-x-hidden' }
          : { options: { wheelPropagation: false, suppressScrollX: true } })}
      >
        <Box className='sidebar-body plb-5 pli-6'>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' className='flex flex-col gap-6'>
            <Controller
              name='title'
              control={control}
              rules={{ required: true }}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  label='Title'
                  value={value}
                  onChange={onChange}
                  {...(errors.title && { error: true, helperText: 'This field is required' })}
                />
              )}
            />
            <input value={'Business'} hidden={true} />

            <AppReactDatepicker
              selectsStart
              id='event-start-date'
              endDate={values.endDate}
              selected={values.startDate}
              startDate={values.startDate}
              showTimeSelect
              dateFormat={'yyyy-MM-dd hh:mm'}
              customInput={<PickersComponent label='Start Date' registername='startDate' />}
              onChange={(date: Date | null) => date !== null && setValues({ ...values, startDate: new Date(date) })}
              onSelect={handleStartDate}
            />

            <AppReactDatepicker
              selectsEnd
              id='event-end-date'
              endDate={values.endDate}
              selected={values.endDate}
              minDate={values.startDate}
              startDate={values.startDate}
              showTimeSelect
              dateFormat={'yyyy-MM-dd hh:mm'}
              customInput={<PickersComponent label='End Date' registername='endDate' />}
              onChange={(date: Date | null) => date !== null && setValues({ ...values, endDate: new Date(date) })}
            />

            <CustomTextField
              rows={4}
              multiline
              fullWidth
              label='Description'
              id='event-description'
              value={values.description}
              onChange={e => setValues({ ...values, description: e.target.value })}
            />
            <div className='flex items-center'>
              <RenderSidebarFooter />
            </div>
          </form>
        </Box>
      </ScrollWrapper>
    </Drawer>
  )
}

export default AddEventSidebar
