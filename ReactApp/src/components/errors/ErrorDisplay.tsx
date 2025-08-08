import { Alert, Button } from "react-bootstrap";

interface IProps {
  onClick?: () => void;
  buttonTitle?: string;
  children: React.ReactNode;
  className?: string;
}

/*
 * This component is designed to be used on any page that fails to retrieve its data from the server,
 * rather than displaying a blank page or eternally loading graphic.
 *
 * Example:
 *
 *   if (error)
 *       return <ErrorDisplay onClick={refetch}>{error.message}</ErrorDisplay>;
 *
 * Other ideas:
 *   - Use <hr/> between message and button
 *   - Use <Alert.Heading> for optional alert title
 *
 */

const ErrorDisplay = (props: IProps) => {
  return (
    <Alert variant="danger" className={props.className}>
      {props.onClick ? (
        <>
          <p>{props.children}</p>
          <p className="mb-0">
            <Button
              variant="primary"
              onClick={() => {
                props.onClick!();
              }}
            >
              {props.buttonTitle || "Refresh"}
            </Button>
          </p>
        </>
      ) : (
        props.children
      )}
    </Alert>
  );
};

export default ErrorDisplay;
