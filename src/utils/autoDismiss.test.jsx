import { autoDismiss } from './autoDismiss';

jest.useFakeTimers();

describe('autoDismiss', () => {
  it('should clear state key after timeout', () => {
    const setState = jest.fn();
    autoDismiss(setState, 'message', 5000);

    expect(setState).not.toHaveBeenCalled();
    jest.advanceTimersByTime(5000);

    expect(setState).toHaveBeenCalledWith(expect.any(Function));
    const updater = setState.mock.calls[0][0];
    const newState = updater({ message: 'Hello' });
    expect(newState.message).toBeNull();
  });

  it('should do nothing if key is falsy', () => {
    const setState = jest.fn();
    autoDismiss(setState, '');
    jest.advanceTimersByTime(10000);
    expect(setState).not.toHaveBeenCalled();
  });
});