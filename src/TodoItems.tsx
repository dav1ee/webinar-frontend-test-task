import { useCallback, useState, ChangeEvent } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import Input from '@material-ui/core/Input';
import { makeStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import { motion } from 'framer-motion';
import { TodoItem, useTodoItems } from './TodoItemsContext';
import { DropResult, DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const spring = {
  type: 'spring',
  damping: 25,
  stiffness: 120,
  duration: 0.25,
};

const useTodoItemListStyles = makeStyles({
  root: {
    listStyle: 'none',
    padding: 0,
  },
});

export const TodoItemsList = function () {
  const { todoItems } = useTodoItems();

  const classes = useTodoItemListStyles();

  const sortedItems = todoItems.slice().sort((a, b) => {
    if (a.done && !b.done) {
      return 1;
    }

    if (!a.done && b.done) {
      return -1;
    }

    return 0;
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const [newOrder] = sortedItems.splice(source.index, 1);
    sortedItems.splice(destination.index, 0, newOrder);
  };

  return (
    <ul className={classes.root}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="todo">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sortedItems.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}>
                      <motion.li key={item.id} transition={spring} layout={true}>
                        <TodoItemCard item={item} />
                      </motion.li>
                    </div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </ul>
  );
};

const useTodoItemCardStyles = makeStyles({
  root: {
    marginTop: 24,
    marginBottom: 24,
  },
  doneRoot: {
    textDecoration: 'line-through',
    color: '#888888',
  },
});

export const TodoItemCard = function ({ item }: { item: TodoItem }) {
  const classes = useTodoItemCardStyles();
  const { dispatch } = useTodoItems();
  const [edit, setEdit] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(item.title);

  const handleDelete = useCallback(
    () => dispatch({ type: 'delete', data: { id: item.id } }),
    [item.id, dispatch],
  );

  const handleToggleDone = useCallback(
    () =>
      dispatch({
        type: 'toggleDone',
        data: { id: item.id },
      }),
    [item.id, dispatch],
  );

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUpdatedTitle(e.target.value);
  };

  const handleUpdateTitle = useCallback(() => {
    dispatch({
      type: 'edit',
      data: { id: item.id, newTitle: updatedTitle },
    });
    setEdit(false);
  }, [item.id, updatedTitle, dispatch]);

  return (
    <>
      {edit ? (
        <Card
          className={classnames(classes.root, {
            [classes.doneRoot]: item.done,
          })}>
          <CardHeader
            action={
              <>
                <IconButton onClick={handleUpdateTitle}>
                  <CheckIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
            title={
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.done}
                    onChange={handleToggleDone}
                    name={`checked-${item.id}`}
                    color="primary"
                  />
                }
                label={<Input value={updatedTitle} autoFocus={true} onChange={handleOnChange} />}
              />
            }
          />
          {item.details ? (
            <CardContent>
              <Typography variant="body2" component="p">
                {item.details}
              </Typography>
            </CardContent>
          ) : null}
        </Card>
      ) : (
        <Card
          className={classnames(classes.root, {
            [classes.doneRoot]: item.done,
          })}>
          <CardHeader
            action={
              <>
                <IconButton aria-label="edit" onClick={() => setEdit(true)}>
                  <EditIcon />
                </IconButton>
                <IconButton aria-label="delete" onClick={handleDelete}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
            title={
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.done}
                    onChange={handleToggleDone}
                    name={`checked-${item.id}`}
                    color="primary"
                  />
                }
                label={item.title}
              />
            }
          />
          {item.details ? (
            <CardContent>
              <Typography variant="body2" component="p">
                {item.details}
              </Typography>
            </CardContent>
          ) : null}
        </Card>
      )}
    </>
  );
};
