/** candidateService.test.ts */

import { sendCandidateData, uploadCV } from './candidateService';

const mockPost = jest.fn();

jest.mock(
  'axios',
  () => ({
	__esModule: true,
	default: {
	  post: (...args) => mockPost(...args),
	},
  }),
  { virtual: true },
);

describe('candidateService', () => {
  beforeEach(() => {
	mockPost.mockReset();
  });

  it('Given valid candidate payload When sendCandidateData Then resolves response data', async () => {
	const payload = { firstName: 'Ana', email: 'ana@example.com' };
	mockPost.mockResolvedValue({ data: { id: 1, ...payload } });

	const result = await sendCandidateData(payload);

	expect(mockPost).toHaveBeenCalledWith('http://localhost:3010/candidates', payload);
	expect(result).toStrictEqual({ id: 1, firstName: 'Ana', email: 'ana@example.com' });
  });

  it('Given api error When sendCandidateData Then throws expected error message', async () => {
	mockPost.mockRejectedValue({ response: { data: { message: 'bad request' } } });

	await expect(sendCandidateData({ email: 'invalid' })).rejects.toThrow('Error al enviar datos del candidato:');
  });

  it('Given file upload success When uploadCV Then resolves response data', async () => {
	const file = new File(['cv-content'], 'cv.pdf', { type: 'application/pdf' });
	mockPost.mockResolvedValue({ data: { filePath: '/tmp/cv.pdf', fileType: 'application/pdf' } });

	const result = await uploadCV(file);

	expect(mockPost).toHaveBeenCalledTimes(1);
	expect(mockPost.mock.calls[0][0]).toBe('http://localhost:3010/upload');
	expect(result).toStrictEqual({ filePath: '/tmp/cv.pdf', fileType: 'application/pdf' });
  });

  it('Given upload error When uploadCV Then throws expected error message', async () => {
	const file = new File(['cv-content'], 'cv.pdf', { type: 'application/pdf' });
	mockPost.mockRejectedValue({ response: { data: { message: 'upload error' } } });

	await expect(uploadCV(file)).rejects.toThrow('Error al subir el archivo:');
  });
});



/** AddCandidateForm.test.ts */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCandidateForm from './AddCandidateForm';
import { mockFetchResponse } from '../test/utils/mockFetch';

jest.mock('./FileUploader', () => {
  return function MockFileUploader(props) {
	return (
	  <button
		type="button"
		onClick={() => props.onUpload({ filePath: '/tmp/cv.pdf', fileType: 'application/pdf' })}
	  >
		Mock Upload CV
	  </button>
	);
  };
});

jest.mock('react-datepicker', () => {
  return function MockDatePicker(props) {
	return (
	  <input
		aria-label={props.placeholderText || 'date'}
		value={props.selected ? 'selected' : ''}
		onChange={(event) => props.onChange(new Date(`${event.target.value}T00:00:00.000Z`))}
	  />
	);
  };
});

describe('AddCandidateForm', () => {
  beforeEach(() => {
	jest.clearAllMocks();
  });

  it('Given initial render When form loads Then required fields and submit button are displayed', () => {
	mockFetchResponse(201);

	render(<AddCandidateForm />);

	expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
	expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
	expect(screen.getByLabelText(/Correo/i)).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('Given user types in base fields When inputs change Then values are reflected in the form', async () => {
	mockFetchResponse(201);
	const user = userEvent.setup();

	render(<AddCandidateForm />);

	await user.type(screen.getByLabelText(/Nombre/i), 'Ana');
	await user.type(screen.getByLabelText(/Apellido/i), 'Lopez');
	await user.type(screen.getByLabelText(/Correo/i), 'ana@example.com');

	expect(screen.getByLabelText(/Nombre/i)).toHaveValue('Ana');
	expect(screen.getByLabelText(/Apellido/i)).toHaveValue('Lopez');
	expect(screen.getByLabelText(/Correo/i)).toHaveValue('ana@example.com');
  });

  it('Given education and experience dates are selected When submit Then payload sends dates as YYYY-MM-DD', async () => {
	mockFetchResponse(201);
	const user = userEvent.setup();

	render(<AddCandidateForm />);

	await user.type(screen.getByLabelText(/Nombre/i), 'Ana');
	await user.type(screen.getByLabelText(/Apellido/i), 'Lopez');
	await user.type(screen.getByLabelText(/Correo/i), 'ana@example.com');

	await user.click(screen.getByRole('button', { name: /Educaci/i }));
	await user.click(screen.getByRole('button', { name: /Experiencia Laboral/i }));

	await user.type(screen.getByPlaceholderText(/Instituci/i), 'Uni');
	await user.type(screen.getByPlaceholderText(/T.tulo/i), 'Grado');
	await user.type(screen.getByPlaceholderText('Empresa'), 'Tech Corp');
	await user.type(screen.getByPlaceholderText('Puesto'), 'Dev');

	const startDateInputs = screen.getAllByLabelText('Fecha de Inicio');
	const endDateInputs = screen.getAllByLabelText('Fecha de Fin');

	fireEvent.change(startDateInputs[0], { target: { value: '2026-04-16' } });
	fireEvent.change(endDateInputs[0], { target: { value: '2026-04-17' } });
	fireEvent.change(startDateInputs[1], { target: { value: '2026-04-18' } });
	fireEvent.change(endDateInputs[1], { target: { value: '2026-04-19' } });

	await user.click(screen.getByRole('button', { name: 'Enviar' }));

	await waitFor(() => {
	  expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	const fetchCall = global.fetch.mock.calls[0];
	const payload = JSON.parse(fetchCall[1].body);

	expect(payload.educations[0]).toMatchObject({
	  startDate: '2026-04-16',
	  endDate: '2026-04-17',
	});
	expect(payload.workExperiences[0]).toMatchObject({
	  startDate: '2026-04-18',
	  endDate: '2026-04-19',
	});
  });

  it('Given successful submit When API returns 201 Then shows success message and clears error', async () => {
	mockFetchResponse(201);
	const user = userEvent.setup();

	render(<AddCandidateForm />);

	await user.type(screen.getByLabelText(/Nombre/i), 'Ana');
	await user.type(screen.getByLabelText(/Apellido/i), 'Lopez');
	await user.type(screen.getByLabelText(/Correo/i), 'ana@example.com');

	await user.click(screen.getByRole('button', { name: 'Enviar' }));

	expect(await screen.findByText(/a.adido con .xito/i)).toBeInTheDocument();
	expect(screen.queryByText(/Error al a.adir candidato:/i)).not.toBeInTheDocument();
  });

  it('Given failed submit When API returns 400 Then shows error and clears success message', async () => {
	mockFetchResponse(400, { message: 'Invalid email' });
	const user = userEvent.setup();

	render(<AddCandidateForm />);

	await user.type(screen.getByLabelText(/Nombre/i), 'Ana');
	await user.type(screen.getByLabelText(/Apellido/i), 'Lopez');
	await user.type(screen.getByLabelText(/Correo/i), 'ana@example.com');

	await user.click(screen.getByRole('button', { name: 'Enviar' }));

	expect(await screen.findByText(/Error al a.adir candidato:/i)).toBeInTheDocument();
	expect(screen.queryByText(/Candidato a.adido con .xito/i)).not.toBeInTheDocument();
  });

  it('Given CV uploaded When submit Then payload includes cv path and type', async () => {
	mockFetchResponse(201);
	const user = userEvent.setup();

	render(<AddCandidateForm />);

	await user.type(screen.getByLabelText(/Nombre/i), 'Ana');
	await user.type(screen.getByLabelText(/Apellido/i), 'Lopez');
	await user.type(screen.getByLabelText(/Correo/i), 'ana@example.com');

	await user.click(screen.getByRole('button', { name: 'Mock Upload CV' }));
	await user.click(screen.getByRole('button', { name: 'Enviar' }));

	await waitFor(() => {
	  expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	const payload = JSON.parse(global.fetch.mock.calls[0][1].body);

	expect(payload.cv).toStrictEqual({ filePath: '/tmp/cv.pdf', fileType: 'application/pdf' });
  });

  it('Given no CV uploaded When submit Then payload sends cv as null', async () => {
	mockFetchResponse(201);
	const user = userEvent.setup();

	render(<AddCandidateForm />);

	await user.type(screen.getByLabelText(/Nombre/i), 'Ana');
	await user.type(screen.getByLabelText(/Apellido/i), 'Lopez');
	await user.type(screen.getByLabelText(/Correo/i), 'ana@example.com');

	await user.click(screen.getByRole('button', { name: 'Enviar' }));

	await waitFor(() => {
	  expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	const payload = JSON.parse(global.fetch.mock.calls[0][1].body);
	expect(payload.cv).toBeNull();
  });
});
