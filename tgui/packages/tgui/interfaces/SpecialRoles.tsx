import { Section, Box, Stack, TimeDisplay, Divider, Button, Dialog } from 'tgui-core/components';
import { useBackend} from '../backend';
import { Window } from '../layouts';
import { useState } from 'react';

type SpecialRolesData = {
  entries: SpecialRolesEntry[];
};

//
type SpecialRolesEntry = {
  id: string;
  isInvasion: Boolean;
  name: string;
  description: string;
  roles: RoleInfo[]; 
  timeLeft: number;
  spawnsLeft: number;
  playerChoice: string;
};

// if entry is wave, then value represents positions of said role; 
// if it is invastion, then it represends a state of this role being available/unavailable (1/0)
type RoleInfo = {
  title: string;
  description: string;
  value: number;
};

type SelectRole = {
  entryId: string;
  role: string;
};


export const SpecialRoles = (props) => {
  const { act, data } = useBackend<SpecialRolesData>();
  const [openedEntryId, setOpenedEntryId] = useState(null);
  const [confirmChoiceDialogState, setConfirmChoiceDialogState] = useState(false);
  var openedEntry;
  if(openedEntryId != null) {
    openedEntry = data.entries.find(entry => entry.id == openedEntryId);
  }
  var content;

  if(openedEntry == undefined) { 
    content = (
      <Stack vertical>
        {data.entries.map(entry => 
          <Stack.Item>
            <Section title = {entry.name}>
              {entry.description}
              <Divider />
              <Stack justify='space-between'>
                <Stack.Item>
                {TimeOrSpawnsInfo(entry)}
                </Stack.Item>
                <Stack.Item>
                {DetailsButton(entry, setOpenedEntryId)}
                </Stack.Item>
              </Stack>
            </Section>
          </Stack.Item>
        )}
      </Stack>
      );
  } else {
    content = (<>
      <Section title={<center><h1>{openedEntry.name}</h1></center>}>
        {openedEntry.roles.map(roleInfo =>
          <Stack vertical>
          <Section title = {roleInfo.title}>
            {roleInfo.description}
              <Divider />
              <Stack justify='space-between'>
                <Stack.Item>
                  {PositionsOrAvailability(roleInfo, openedEntry)}
                </Stack.Item>
                <Stack.Item>
                  {RoleSelectButton(roleInfo, openedEntry, act, setConfirmChoiceDialogState)}
                </Stack.Item>
              </Stack>
          </Section>
        </Stack>
        )}
      </Section>
      <Section>
        <Stack justify='space-between'>
          <Stack.Item>
            {TimeOrSpawnsInfo(openedEntry)}
          </Stack.Item>
          <Stack.Item>
            <Button onClick={() =>setOpenedEntryId(null)}>Back</Button>
          </Stack.Item>
        </Stack>
      </Section>

      {confirmChoiceDialogState &&
        <Dialog width='90%' title="Remember" onClose={() => {setConfirmChoiceDialogState(false)}}>
          <Box style={{margin: '1em', textIndent: '1em'}}>
            Please keep in mind that if someone else will successfully roll for this role - you will be given a random one.
          </Box>
        </Dialog>
      }
    </>);
  }

  return (
    <Window width={380} height={560} title="Special Roles">
      <Window.Content scrollable>
        {content}
      </Window.Content>
    </Window>
  ); 
};

function DetailsButton(entry: SpecialRolesEntry, openedEntrySetter) {
  if(entry.isInvasion) {
    return <Button textAlign='center' onClick={ () => openedEntrySetter(entry.id) }>Join Now...</Button>;
  }
  if(entry.playerChoice != null) {
    return <Button textAlign='center' color='grey' onClick={ () => openedEntrySetter(entry.id) }>Change Role...</Button>;
  }
  return <Button textAlign='center' onClick={ () => openedEntrySetter(entry.id) }>Choose Role...</Button>;
};

function RoleSelectButton(roleInfo: RoleInfo, entry: SpecialRolesEntry, act, setConfirmChoiceDialogState) {
  const selectAction = () => {
    if(entry.playerChoice == null) {
      setConfirmChoiceDialogState(true)
    }
    act("selectrole", {entryId: entry.id, role: roleInfo.title})
  }

  if(entry.isInvasion) {
    if(roleInfo.value) return <Button textAlign='center' onClick={selectAction}>Join</Button>;
    else return <Button textAlign='center' disabled>Join</Button>;
  }
  if(entry.playerChoice == roleInfo.title) {
    return <Button textAlign='center' color='grey' onClick={selectAction}>Cancel</Button>;
  }
  return <Button textAlign='center' onClick={selectAction}>Select</Button>;
};

function PositionsOrAvailability(roleInfo: RoleInfo, entry: SpecialRolesEntry) {
  if(entry.isInvasion) {
    if(roleInfo.value) return <Box style={{color: 'green'}}>This role is available!</Box>;
    else return <Box style={{color: 'red'}}>Join other role or try later...</Box>;
  } else {
    return <Box>Positions available: {roleInfo.value}</Box>;
  }
};

function TimeOrSpawnsInfo(entry: SpecialRolesEntry) {
  if(entry.isInvasion) {
    return <Box>Spawns left: <b>{entry.spawnsLeft}</b></Box>;
  } else {
    var timeToDisplay;
    if(entry.timeLeft > 0) {
      timeToDisplay = <b><TimeDisplay value={entry.timeLeft}/></b>;
    } else {
      timeToDisplay = <b>NOW!</b>;
    }
    return <Box>Time before arrival: {timeToDisplay}</Box>;
  }
};
