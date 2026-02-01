import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlassSwitcher } from '../GlassSwitcher';

describe('GlassSwitcher', () => {
  it('renders options and emits changes', async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(
      <GlassSwitcher
        aria-label="Example switcher"
        onChange={handleChange}
        options={[
          { icon: <span>1</span>, label: 'First', value: 'first' },
          { icon: <span>2</span>, label: '', value: 'second' },
        ]}
        value="first"
      />,
    );

    const group = screen.getByRole('radiogroup', { name: 'Example switcher' });
    expect(group).toBeInTheDocument();

    const radios = screen.getAllByRole('radio', { hidden: true });
    expect(radios).toHaveLength(2);
    const firstRadio = radios[0];
    const secondRadio = radios[1];
    if (!firstRadio || !secondRadio) {
      throw new Error('Expected two radio options');
    }
    expect(firstRadio).toBeChecked();

    await user.click(secondRadio);
    expect(handleChange).toHaveBeenCalledWith('second');

    expect(screen.getAllByRole('tooltip')).toHaveLength(1);
  });
});
