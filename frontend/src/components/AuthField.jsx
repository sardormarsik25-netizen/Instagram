// daisyUI form-control + input with icon. `error` shows a hint under the field.
const AuthField = ({ id, label, icon: Icon, trailing, error, ...inputProps }) => (
  <div className="form-control w-full">
    <label className="label pb-1" htmlFor={id}>
      <span className="label-text font-medium">{label}</span>
    </label>
    <label
      className={`input input-bordered flex items-center gap-3 ${error ? 'input-error' : 'focus-within:input-primary'}`}
    >
      <Icon className="shrink-0 opacity-50" size={18} />
      <input id={id} className="grow" aria-invalid={Boolean(error)} {...inputProps} />
      {trailing}
    </label>
    {error && (
      <div className="label pb-0">
        <span className="label-text-alt text-error">{error}</span>
      </div>
    )}
  </div>
);

export default AuthField;
