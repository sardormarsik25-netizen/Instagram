const AuthField = ({ id, label, icon: Icon, trailing, ...inputProps }) => (
  <div className="form-control w-full gap-1">
    <label className="label px-0" htmlFor={id}>
      <span className="label-text font-semibold">{label}</span>
    </label>
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/50"
        size={18}
      />
      <input
        id={id}
        className="input input-bordered input-primary w-full pl-11 pr-12"
        {...inputProps}
      />
      {trailing}
    </div>
  </div>
);

export default AuthField;
