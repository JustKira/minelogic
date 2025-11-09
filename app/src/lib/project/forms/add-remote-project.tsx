import { useForm } from '@tanstack/react-form'
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/lib/core/elements/field'
import { Input } from '@/lib/core/elements/input'
import { Button } from '@/lib/core/elements/button'

import { z } from 'zod'
import { useAddRemoteProjectMutation } from '../api'
import { Separator } from '@/lib/core/elements/separator'

const AddRemoteProjectFormSchema = z.object({
  host: z.string().nonempty(),
  port: z.number().nonnegative(),
  user: z.string().nonempty(),
  password: z.string().nonempty(),
})

export function AddRemoteProjectForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const addProjectRemoteMutation = useAddRemoteProjectMutation()
  const form = useForm({
    defaultValues: {
      host: '',
      port: 22,
      user: 'root',
      password: '',
    } satisfies z.output<typeof AddRemoteProjectFormSchema>,
    validators: {
      onSubmit: AddRemoteProjectFormSchema,
    },
    onSubmit: async ({ value }) => {
      addProjectRemoteMutation.mutate(
        [value.host, value.port, value.user, value.password],
        {
          onSuccess: () => {
            onSuccess?.()
          },
        },
      )
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup className="flex flex-row gap-2">
        <form.Field
          name="host"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Host</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="192.168.1.1"
                  autoComplete="off"
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="port"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Port</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  aria-invalid={isInvalid}
                  placeholder="22"
                  autoComplete="off"
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
      </FieldGroup>
      <Separator className="my-4" />
      <FieldGroup>
        <form.Field
          name="user"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>User</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="root"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="password"
                  type="password"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Remote Project'}
            </Button>
          )}
        />
      </FieldGroup>
    </form>
  )
}
