import { screen } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'

// Completa el checkout con datos válidos (mail en example.com, dominio reservado para pruebas).
export async function fillValidForm(user: UserEvent) {
  await user.type(screen.getByLabelText('Email'), 'lucas.fernandez@example.com')
  await user.type(screen.getByLabelText('Nombre'), 'Lucas')
  await user.type(screen.getByLabelText('Apellido'), 'Fernández')
  await user.type(screen.getByLabelText('Teléfono'), '11 4567-8910')
  await user.type(screen.getByLabelText('Calle y número'), 'Av. Corrientes 1234')
  await user.type(screen.getByLabelText('Localidad'), 'Buenos Aires')
  await user.selectOptions(screen.getByLabelText('Provincia'), 'Ciudad Autónoma de Buenos Aires')
  await user.type(screen.getByLabelText('Código postal'), 'C1043AAZ')
}
