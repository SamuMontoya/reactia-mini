import '@testing-library/jest-dom';
// This project imports `expect` from '@jest/globals' rather than relying on
// jest's implicit globals, and jest-dom 7 ships a separate type-only entry
// point that augments THAT module's `Matchers` interface — the default
// import above only augments the classic global `jest.Expect`, which is why
// `.toBeInTheDocument()` etc. type-checked as missing until this was added.
import '@testing-library/jest-dom/jest-globals';
