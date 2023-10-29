import { useEffect } from "react";
import { useState } from "react";
import { signUp } from "../../services/user-service";
import { toast } from "react-toastify";
import { loadAllDepartments } from "../../services/department-service"
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
} from "reactstrap";
const Signup = () => {
  const [departments, setDepartments] = useState([])
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    about: "",
    depId:"",
  });

  const [error, setError] = useState({
    errors: {},
    isError: false,
  });

  useEffect(
    () => {

      loadAllDepartments().then((data) => {
            setDepartments(data)
        }).catch(error => {
            console.log(error)
        })
    },
    []
)

  // handle change
  const handleChange = (event, property) => {
    //dynamic setting the values
    setData({ ...data, [property]: event.target.value });
  };

const fieldChanged = (event) => {
 
  const selectedDepartmentIds = Array.from(event.target.selectedOptions, (option) => parseInt(option.value));
  const selectedDepartments = departments.filter(department => selectedDepartmentIds.includes(department.id));

  setData({ ...data, [event.target.name]: event.target.value })


}

  //reseting the form
  const resetData = () => {
    setData({
      name: "",
      email: "",
      password: "",
      about: "",
      depId: "",
    });
  };

  //submit the form
  const submitForm = (event) => {
    event.preventDefault();

    signUp(data)
      .then((resp) => {
        toast.success("User is registered successfully with user id " + resp.id);
        setData({
          name: "",
          email: "",
          password: "",
          about: "",
          depId: "",
        });
      })
      .catch((error) => {
        console.log(error);
        console.log("Error log");
        toast.error("Failed to register");
        //handle errors in proper way
        setError({
          errors: error,
          isError: true,
        });
      });
  };

  return (
      <Container>
        <Row className="mt-4">
          {/* { JSON.stringify(data) } */}

          <Col sm={{ size: 6, offset: 3 }} >
            <Card style={{
                backgroundColor: '#f2f2f2'
                }}>
              <CardHeader>
                <h3> Fill Information to Register</h3>
              </CardHeader>

              <CardBody>
                {/* creating form */}

                <Form onSubmit={submitForm}>
                  {/* Name field */}
                  <FormGroup>
                    <Label for="name">Enter Name</Label>
                    <Input
                      type="text"
                      placeholder="Enter here"
                      id="name"
                      onChange={(e) => handleChange(e, "name")}
                      value={data.name}
                      invalid={
                        error.errors?.response?.data?.name ? true : false
                      }
                    />

                    <FormFeedback>
                      {error.errors?.response?.data?.name}
                    </FormFeedback>
                  </FormGroup>

                  {/* email field */}
                  <FormGroup>
                    <Label for="email">Enter Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter here"
                      id="email"
                      onChange={(e) => handleChange(e, "email")}
                      value={data.email}
                      invalid={
                        error.errors?.response?.data?.email ? true : false
                      }
                    />

                    <FormFeedback>
                      {error.errors?.response?.data?.email}
                    </FormFeedback>
                  </FormGroup>

                  {/* password field */}
                  <FormGroup>
                    <Label for="password">Enter Password</Label>
                    <Input
                      type="password"
                      placeholder="Enter here"
                      id="password"
                      onChange={(e) => handleChange(e, "password")}
                      value={data.password}
                      invalid={
                        error.errors?.response?.data?.password ? true : false
                      }
                    />

                    <FormFeedback>
                      {error.errors?.response?.data?.password}
                    </FormFeedback>
                  </FormGroup>

                  {/* about field */}
                  <FormGroup>
                    <Label for="about">About/Details</Label>
                    <Input
                      type="textarea"
                      placeholder="Enter here"
                      id="about"
                      style={{ height: "100px" }}
                      onChange={(e) => handleChange(e, "about")}
                      value={data.about}
                      invalid={
                        error.errors?.response?.data?.about ? true : false
                      }
                    />

                    <FormFeedback>
                      {error.errors?.response?.data?.about}
                    </FormFeedback>
                  </FormGroup>

                  <FormGroup>
                    <Label for="depId">User Department</Label>
                    <Input
                      type="select"
                      id="depId"
                      placeholder="Select here"
                      className="rounded-0"
                      name="depId"
                      onChange={fieldChanged}
                                defaultValue={0}
                      /* onChange={(e) => handleChange(e, "about")}
                      value={data.about} */
                    >
                      
                      <option disabled value={0} >--Select Department--</option>

                      {

                          departments.map((department) => (
                            <option value={department.id} key={department.id}>
                                  {department.depName}
                              </option>
                          ))

                      }

                      </Input>
                    <FormFeedback>
                      {error.errors?.response?.data?.departments}
                    </FormFeedback>
                  </FormGroup>

                  <Container className="text-center">
                    <Button outline color="dark">
                      Register
                    </Button>
                    <Button
                      onClick={resetData}
                      color="secondary"
                      type="reset"
                      className="ms-2"
                    >
                      Reset
                    </Button>
                  </Container>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
  );
};

export default Signup;
