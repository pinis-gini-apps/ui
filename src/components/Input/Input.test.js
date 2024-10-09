import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import Input from './Input'

test('renders input field', () => {
  render(<Input placeholder="Type here" />)
  const inputElement = screen.getByPlaceholderText('Type here')
  expect(inputElement).toBeInTheDocument()
})

test('input changes value on typing', () => {
  const handleChange = jest.fn()
  render(<Input placeholder="Type here" value="" onChange={handleChange} />)
  const inputElement = screen.getByPlaceholderText('Type here')

  // Simulate typing in the input field
  fireEvent.change(inputElement, { target: { value: 'Hello' } })
  expect(handleChange).toHaveBeenCalledTimes(1)
})
