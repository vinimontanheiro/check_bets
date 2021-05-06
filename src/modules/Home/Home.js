import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import * as Yup from 'yup';
import { Paper, TextField, FormHelperText, FormControl } from '@material-ui/core';
import { Formik } from 'formik';

const Container = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Result = styled.div`
  width: '100%';
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const Rounded = styled.div`
  width: 30px;
  height: 30px;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  margin-right: 4px;
  background-color: ${({ bgcolor }) => bgcolor || `#CCC`};
`;

const Body = styled(Paper)`
  && {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 35px 20px;
    min-width: 400px;
  }
`;

const Form = styled.form`
  width: 100%;
`;

const Diviver = styled.div`
  height: 10px;
`;

const MessageError = styled(FormHelperText)`
  && {
    align-self: flex-start;
  }
`;

const isValid = v => v && v.match(/\d{2}\d{2}\d{2}\d{2}\d{2}/g);

const validationSchema = () =>
  Yup.object().shape({
    result: Yup.string()
      .required(`Campo obrigatório!`)
      .test(`result`, `Valor inválido!`, resut => isValid(resut)),
    bet: Yup.string()
      .required(`Campo obrigatório!`)
      .when([`result`], (result, schema) => {
        return schema.max(result.length, `Aposta maior que o resultado informado!`);
      }),
  });

const RenderMessageError = ({ label, errors }) => {
  if (errors[label]) {
    const message = errors[label];
    return <MessageError error>{message}</MessageError>;
  }
  return <></>;
};

RenderMessageError.propTypes = {
  label: PropTypes.string.isRequired,
  errors: PropTypes.shape({}).isRequired,
};

const initial = `000000000000`;

const Home = () => {
  const makeAPair = useCallback(
    (value, callback) =>
      Array.from(value).reduce((acc, item, index) => {
        if (index % 2 === 0) {
          const pair = value.slice(index, index + 2);
          if (typeof callback === `function`) {
            return callback(acc, pair);
          }
          return [...acc, ...[pair]];
        }
        return acc;
      }, []),
    [],
  );

  const showResult = useCallback(
    (result, bet) =>
      makeAPair(result, (acc, pair) => {
        const bets = makeAPair(bet);
        const matched = bets.find(num => `${num}` === `${pair}`);
        return [...acc, ...[{ pair, matched }]];
      }),
    [makeAPair],
  );

  return (
    <Container>
      <Content id="drag" className="draggable">
        <Body elevation={3}>
          <Formik
            initialValues={{ result: initial, bet: `` }}
            validationSchema={validationSchema()}
            validateOnBlur
            validateOnChange
            render={({ values, handleChange, errors }) => (
              <Form>
                <Result>
                  {showResult(isValid(values.result) ? values.result : initial, values.bet).map(
                    ({ pair, matched }) => {
                      return <Rounded bgcolor={matched ? `#54f95d` : `#CCC`}>{pair}</Rounded>;
                    },
                  )}
                </Result>
                <FormControl fullWidth>
                  <TextField
                    id="result"
                    label="Resultado"
                    value={values.result === initial ? `` : values.result}
                    onChange={handleChange(`result`)}
                  />
                  <RenderMessageError label="result" errors={errors} />
                  <Diviver />
                  <TextField
                    id="bet"
                    label="Aposta"
                    value={values.bet}
                    onChange={handleChange(`bet`)}
                    le
                  />
                  <RenderMessageError label="bet" errors={errors} />
                </FormControl>
              </Form>
            )}
          />
        </Body>
      </Content>
    </Container>
  );
};

Home.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default Home;
