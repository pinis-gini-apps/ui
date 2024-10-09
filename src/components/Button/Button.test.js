import { render, fireEvent } from '@testing-library/react'
import Button from './Button'

test('renders button with text', () => {
  const { getByText } = render(<Button text="Click me" />)
  expect(getByText('Click me')).toBeInTheDocument()
})

test('calls onClick when clicked', () => {
  const handleClick = jest.fn()
  const { getByText } = render(<Button text="Click me" onClick={handleClick} />)

  fireEvent.click(getByText('Click me'))

  expect(handleClick).toHaveBeenCalledTimes(1)
})
