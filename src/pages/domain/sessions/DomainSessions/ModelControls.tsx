import * as React from 'react';
import {ReactElement, ReactNode} from "react";
import {Input, InputNumber, Select} from "antd";
import {Form, Button} from 'antd';
import {FormComponentProps} from "antd/lib/form";
import {CollectionAutoComplete} from "../../../../components/domain/collection/CollectionAutoComplete";
import {DomainId} from "../../../../models/DomainId";
import styles from "./styles.module.css";
import {IReactComponent} from "mobx-react";

const {Option} = Select;

enum SearchMode {
  BROWSE = "browse",
  QUERY = "query",
  ID = "id",
}
interface ModelControlsProps {
  domainId: DomainId;
  resultsPerPageDefault: number;
  onBrowse(collection: string, perPage: number): void;
  onQuery(query: string, perPage: number): void;
  onIdLookup(modelId: string, perPage: number): void;
}

interface InjectedProps extends ModelControlsProps, FormComponentProps {

}

class ModelControlsComponent extends React.Component<InjectedProps, {}> {

  public render(): ReactNode {
    const {getFieldDecorator} = this.props.form;
    const mode = this.props.form.getFieldValue("mode") as SearchMode || SearchMode.BROWSE;
    let fieldLabel = "";
    let buttonLabel = "";
    switch (mode) {
      case SearchMode.BROWSE:
        fieldLabel = "Collection";
        buttonLabel = "Browse";
        break;
      case SearchMode.QUERY:
        fieldLabel = "Query";
        buttonLabel = "Query";
        break;
      case SearchMode.ID:
        fieldLabel = "Model Id";
        buttonLabel = "Search";
        break;
    }

    return (
      <div className={styles.toolbar}>
        <div className={styles.modeSelector}>
          <span className={styles.label}>Mode:</span>
          {getFieldDecorator('mode', {initialValue: SearchMode.BROWSE})(
            <Select style={{width: 150}}>
              <Option key={SearchMode.BROWSE} value={SearchMode.BROWSE}>Browse</Option>
              <Option key={SearchMode.QUERY} value={SearchMode.QUERY}>Query</Option>
              <Option key={SearchMode.ID} value={SearchMode.ID}>Id Lookup</Option>
            </Select>
          )}
        </div>
        <span className={styles.label}>{fieldLabel}:</span>
        {
          mode === SearchMode.BROWSE ?
            getFieldDecorator('collection')(
              <CollectionAutoComplete className={styles.collection} domainId={this.props.domainId}/>
            ) : null
        }
        {
          mode === SearchMode.QUERY ?
            getFieldDecorator('query')(
              <Input className={styles.query} placeholder="Enter Query"/>
            ) : null
        }
        {
          mode === SearchMode.ID ?
            getFieldDecorator('id')(
              <Input className={styles.id} placeholder="Enter Model Id"/>
            ) : null
        }
        <span className={styles.label}>Results Per Page:</span>
        {getFieldDecorator('resultsPerPage', {initialValue: this.props.resultsPerPageDefault || 20})(
          <InputNumber/>
        )}
        <Button htmlType="button"
                type="primary"
                className={styles.button}
                onClick={this._handleSubmit}>{buttonLabel}</Button>
      </div>
    );
  }

  private _handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err: any, values: any) => {
      if (!err) {
        const {mode, collection, query, id, resultsPerPage} = values;
        switch (mode) {
          case "browse":
            this.props.onBrowse(collection, resultsPerPage);
            break;
          case "query":
            this.props.onQuery(query, resultsPerPage);
            break;
          case "id":
            this.props.onIdLookup(id, resultsPerPage);
            break;
        }
      }
    });
  }
}

export const ModelControls = Form.create<{}>()(ModelControlsComponent) as IReactComponent<ModelControlsProps>;
