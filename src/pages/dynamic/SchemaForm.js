import React from "react";
// @ts-ignore
import { useForm } from "react-hook-form";
// @ts-ignore
import { styled } from "@material-ui/styles";
// @ts-ignore
import { Form, Input, DatePicker, InputNumber, Button } from "antd";
// @ts-ignore
import { useMutation } from "@apollo/client";
import { CREATE_MODEL } from "graphql/queries";

const StyledForm = styled(Form)({
  "& > .ant-form-item": {}
});

const FIELDS = {
  text: ({ name, onChange, ...props }) => (
    <Input {...props} onChange={e => onChange(name, e.target.value)} />
  ),
  textarea: ({ name, onChange, ...props }) => (
    <Input.TextArea {...props} onChange={e => onChange(name, e.target.value)} />
  ),
  date: ({ name, onChange, ...props }) => (
    <DatePicker {...props} onChange={(e, s) => onChange(name, s)} />
  ),
  number: ({ name, onChange, ...props }) => (
    <InputNumber {...props} onChange={e => onChange(name, e)} />
  )
};

export default function({ fields, collection, submit, ...formProps }) {
  const { register, handleSubmit, errors, setValue } = useForm();
  const [createModel, { data: result }] = useMutation(CREATE_MODEL);

  const onSubmit = data => {
    createModel({ variables: { data } });
  };

  const handleChange = (name, value) => {
    setValue(name, value);
  };

  React.useEffect(() => {
    fields.forEach(({ name }) => register({ name }));
  }, [register, fields]);

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)} {...formProps}>
      {fields.map(({ type, label, ...rest }) => {
        const CustomItem = FIELDS[type];
        return (
          <Form.Item key={rest.name} label={label}>
            <CustomItem
              style={{ width: "100%" }}
              onChange={handleChange}
              {...rest}
            />
          </Form.Item>
        );
      })}
      <Form.Item wrapperCol={{ span: 12, offset: 5 }}>
        <Button type="primary" htmlType="submit">
          {submit}
        </Button>
      </Form.Item>
    </StyledForm>
  );
}
