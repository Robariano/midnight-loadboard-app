import * as __compactRuntime from '@midnight-ntwrk/compact-runtime';
__compactRuntime.checkRuntimeVersion('0.21.0');

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(4294967295n, 4);

class _AuthorityStatus_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      checkedAt: _descriptor_1.fromValue(value_0),
      record: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.checkedAt).concat(_descriptor_0.toValue(value_0.record));
  }
}

const _descriptor_3 = new _AuthorityStatus_0();

const _descriptor_4 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_5 = __compactRuntime.CompactTypeJubjubPoint;

const _descriptor_6 = __compactRuntime.CompactTypeBoolean;

const _descriptor_7 = __compactRuntime.CompactTypeField;

const _descriptor_8 = new __compactRuntime.CompactTypeVector(6, _descriptor_7);

class _Coverage_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment())));
  }
  fromValue(value_0) {
    return {
      dot: _descriptor_2.fromValue(value_0),
      liability: _descriptor_2.fromValue(value_0),
      cargo: _descriptor_2.fromValue(value_0),
      expiresAt: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.dot).concat(_descriptor_2.toValue(value_0.liability).concat(_descriptor_2.toValue(value_0.cargo).concat(_descriptor_1.toValue(value_0.expiresAt))));
  }
}

const _descriptor_9 = new _Coverage_0();

class _CoverageProof_0 {
  alignment() {
    return _descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_4.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment()))))));
  }
  fromValue(value_0) {
    return {
      dot: _descriptor_2.fromValue(value_0),
      minLiability: _descriptor_2.fromValue(value_0),
      minCargo: _descriptor_2.fromValue(value_0),
      coveredThrough: _descriptor_1.fromValue(value_0),
      attestorId: _descriptor_4.fromValue(value_0),
      authorityCheckedAt: _descriptor_1.fromValue(value_0),
      authorityRecord: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_2.toValue(value_0.dot).concat(_descriptor_2.toValue(value_0.minLiability).concat(_descriptor_2.toValue(value_0.minCargo).concat(_descriptor_1.toValue(value_0.coveredThrough).concat(_descriptor_4.toValue(value_0.attestorId).concat(_descriptor_1.toValue(value_0.authorityCheckedAt).concat(_descriptor_0.toValue(value_0.authorityRecord)))))));
  }
}

const _descriptor_10 = new _CoverageProof_0();

const _descriptor_11 = __compactRuntime.CompactTypeJubjubScalar;

class _SchnorrSignature_0 {
  alignment() {
    return _descriptor_5.alignment().concat(_descriptor_11.alignment());
  }
  fromValue(value_0) {
    return {
      announcement: _descriptor_5.fromValue(value_0),
      response: _descriptor_11.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_5.toValue(value_0.announcement).concat(_descriptor_11.toValue(value_0.response));
  }
}

const _descriptor_12 = new _SchnorrSignature_0();

class _tuple_0 {
  alignment() {
    return _descriptor_9.alignment().concat(_descriptor_7.alignment().concat(_descriptor_12.alignment().concat(_descriptor_4.alignment())));
  }
  fromValue(value_0) {
    return [
      _descriptor_9.fromValue(value_0),
      _descriptor_7.fromValue(value_0),
      _descriptor_12.fromValue(value_0),
      _descriptor_4.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_9.toValue(value_0[0]).concat(_descriptor_7.toValue(value_0[1]).concat(_descriptor_12.toValue(value_0[2]).concat(_descriptor_4.toValue(value_0[3]))));
  }
}

const _descriptor_13 = new _tuple_0();

const _descriptor_14 = new __compactRuntime.CompactTypeUnsignedInteger(127n, 1);

const _descriptor_15 = new __compactRuntime.CompactTypeUnsignedInteger(452312848583266388373324160190187140051835877600158453279131187530910662655n, 31);

class _tuple_1 {
  alignment() {
    return _descriptor_14.alignment().concat(_descriptor_15.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_14.fromValue(value_0),
      _descriptor_15.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_14.toValue(value_0[0]).concat(_descriptor_15.toValue(value_0[1]));
  }
}

const _descriptor_16 = new _tuple_1();

const _descriptor_17 = new __compactRuntime.CompactTypeBytes(20);

class _tuple_2 {
  alignment() {
    return _descriptor_17.alignment().concat(_descriptor_7.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_17.fromValue(value_0),
      _descriptor_7.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_17.toValue(value_0[0]).concat(_descriptor_7.toValue(value_0[1]));
  }
}

const _descriptor_18 = new _tuple_2();

const _descriptor_19 = new __compactRuntime.CompactTypeBytes(23);

class _tuple_3 {
  alignment() {
    return _descriptor_19.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_19.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_19.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_20 = new _tuple_3();

const _descriptor_21 = new __compactRuntime.CompactTypeBytes(21);

class _tuple_4 {
  alignment() {
    return _descriptor_21.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return [
      _descriptor_21.fromValue(value_0),
      _descriptor_0.fromValue(value_0)
    ]
  }
  toValue(value_0) {
    return _descriptor_21.toValue(value_0[0]).concat(_descriptor_0.toValue(value_0[1]));
  }
}

const _descriptor_22 = new _tuple_4();

class _SchnorrHashInput_0 {
  alignment() {
    return _descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_7.alignment().concat(_descriptor_8.alignment()))));
  }
  fromValue(value_0) {
    return {
      ann_x: _descriptor_7.fromValue(value_0),
      ann_y: _descriptor_7.fromValue(value_0),
      pk_x: _descriptor_7.fromValue(value_0),
      pk_y: _descriptor_7.fromValue(value_0),
      msg: _descriptor_8.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_7.toValue(value_0.ann_x).concat(_descriptor_7.toValue(value_0.ann_y).concat(_descriptor_7.toValue(value_0.pk_x).concat(_descriptor_7.toValue(value_0.pk_y).concat(_descriptor_8.toValue(value_0.msg)))));
  }
}

const _descriptor_23 = new _SchnorrHashInput_0();

class _Either_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_6.fromValue(value_0),
      left: _descriptor_0.fromValue(value_0),
      right: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.is_left).concat(_descriptor_0.toValue(value_0.left).concat(_descriptor_0.toValue(value_0.right)));
  }
}

const _descriptor_24 = new _Either_0();

const _descriptor_25 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_26 = new _ContractAddress_0();

class _UserAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_27 = new _UserAddress_0();

class _Either_1 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_26.alignment().concat(_descriptor_27.alignment()));
  }
  fromValue(value_0) {
    return {
      is_left: _descriptor_6.fromValue(value_0),
      left: _descriptor_26.fromValue(value_0),
      right: _descriptor_27.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.is_left).concat(_descriptor_26.toValue(value_0.left).concat(_descriptor_27.toValue(value_0.right)));
  }
}

const _descriptor_28 = new _Either_1();

class _Maybe_0 {
  alignment() {
    return _descriptor_6.alignment().concat(_descriptor_28.alignment());
  }
  fromValue(value_0) {
    return {
      is_some: _descriptor_6.fromValue(value_0),
      value: _descriptor_28.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_6.toValue(value_0.is_some).concat(_descriptor_28.toValue(value_0.value));
  }
}

const _descriptor_29 = new _Maybe_0();

const _descriptor_30 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

export class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.getSchnorrReduction) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getSchnorrReduction');
    }
    if (typeof(witnesses_0.getSecretKey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getSecretKey');
    }
    if (typeof(witnesses_0.getCoverageAttestation) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named getCoverageAttestation');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      async deriveCarrierPublicKey(context, ...args_1) {
        return { result: pureCircuits.deriveCarrierPublicKey(...args_1), context };
      },
      async deriveAdminPublicKey(context, ...args_1) {
        return { result: pureCircuits.deriveAdminPublicKey(...args_1), context };
      },
      async attestationId(context, ...args_1) {
        return { result: pureCircuits.attestationId(...args_1), context };
      },
      async attestationMessage(context, ...args_1) {
        return { result: pureCircuits.attestationMessage(...args_1), context };
      },
      proveCoverage: async (...args_1) => {
        if (args_1.length !== 5) {
          throw new __compactRuntime.CompactError(`proveCoverage: expected 5 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const requestId_0 = args_1[1];
        const minLiability_0 = args_1[2];
        const minCargo_0 = args_1[3];
        const coveredThrough_0 = args_1[4];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('proveCoverage',
                                     'argument 1 (as invoked from Typescript)',
                                     'coverage-proof.compact line 134 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(requestId_0.buffer instanceof ArrayBuffer && requestId_0.BYTES_PER_ELEMENT === 1 && requestId_0.length === 32)) {
          __compactRuntime.typeError('proveCoverage',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'coverage-proof.compact line 134 char 1',
                                     'Bytes<32>',
                                     requestId_0)
        }
        if (!(typeof(minLiability_0) === 'bigint' && minLiability_0 >= 0n && minLiability_0 <= 4294967295n)) {
          __compactRuntime.typeError('proveCoverage',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'coverage-proof.compact line 134 char 1',
                                     'Uint<0..4294967296>',
                                     minLiability_0)
        }
        if (!(typeof(minCargo_0) === 'bigint' && minCargo_0 >= 0n && minCargo_0 <= 4294967295n)) {
          __compactRuntime.typeError('proveCoverage',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'coverage-proof.compact line 134 char 1',
                                     'Uint<0..4294967296>',
                                     minCargo_0)
        }
        if (!(typeof(coveredThrough_0) === 'bigint' && coveredThrough_0 >= 0n && coveredThrough_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('proveCoverage',
                                     'argument 4 (argument 5 as invoked from Typescript)',
                                     'coverage-proof.compact line 134 char 1',
                                     'Uint<0..18446744073709551616>',
                                     coveredThrough_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(requestId_0).concat(_descriptor_2.toValue(minLiability_0).concat(_descriptor_2.toValue(minCargo_0).concat(_descriptor_1.toValue(coveredThrough_0)))),
            alignment: _descriptor_0.alignment().concat(_descriptor_2.alignment().concat(_descriptor_2.alignment().concat(_descriptor_1.alignment())))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._proveCoverage_0(context,
                                                     partialProofData,
                                                     requestId_0,
                                                     minLiability_0,
                                                     minCargo_0,
                                                     coveredThrough_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      async coverageChallenge(context, ...args_1) {
        return { result: pureCircuits.coverageChallenge(...args_1), context };
      },
      registerAttestor: async (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`registerAttestor: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const id_0 = args_1[1];
        const pk_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('registerAttestor',
                                     'argument 1 (as invoked from Typescript)',
                                     'coverage-proof.compact line 187 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 65535n)) {
          __compactRuntime.typeError('registerAttestor',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'coverage-proof.compact line 187 char 1',
                                     'Uint<0..65536>',
                                     id_0)
        }
        if (!(typeof(pk_0.x) === 'bigint' && pk_0.x >= 0n && pk_0.x <= __compactRuntime.MAX_FIELD && typeof(pk_0.y) === 'bigint' && pk_0.y >= 0n && pk_0.y <= __compactRuntime.MAX_FIELD)) {
          __compactRuntime.typeError('registerAttestor',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'coverage-proof.compact line 187 char 1',
                                     'JubjubPoint',
                                     pk_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_4.toValue(id_0).concat(_descriptor_5.toValue(pk_0)),
            alignment: _descriptor_4.alignment().concat(_descriptor_5.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._registerAttestor_0(context,
                                                        partialProofData,
                                                        id_0,
                                                        pk_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      removeAttestor: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`removeAttestor: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('removeAttestor',
                                     'argument 1 (as invoked from Typescript)',
                                     'coverage-proof.compact line 192 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(id_0) === 'bigint' && id_0 >= 0n && id_0 <= 65535n)) {
          __compactRuntime.typeError('removeAttestor',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'coverage-proof.compact line 192 char 1',
                                     'Uint<0..65536>',
                                     id_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_4.toValue(id_0),
            alignment: _descriptor_4.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._removeAttestor_0(context,
                                                      partialProofData,
                                                      id_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      revokeAttestation: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`revokeAttestation: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const id_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('revokeAttestation',
                                     'argument 1 (as invoked from Typescript)',
                                     'coverage-proof.compact line 200 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(id_0.buffer instanceof ArrayBuffer && id_0.BYTES_PER_ELEMENT === 1 && id_0.length === 32)) {
          __compactRuntime.typeError('revokeAttestation',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'coverage-proof.compact line 200 char 1',
                                     'Bytes<32>',
                                     id_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(id_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._revokeAttestation_0(context,
                                                         partialProofData,
                                                         id_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      setAuthority: async (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`setAuthority: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const dot_0 = args_1[1];
        const checkedAt_0 = args_1[2];
        const record_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('setAuthority',
                                     'argument 1 (as invoked from Typescript)',
                                     'coverage-proof.compact line 207 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(dot_0) === 'bigint' && dot_0 >= 0n && dot_0 <= 4294967295n)) {
          __compactRuntime.typeError('setAuthority',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'coverage-proof.compact line 207 char 1',
                                     'Uint<0..4294967296>',
                                     dot_0)
        }
        if (!(typeof(checkedAt_0) === 'bigint' && checkedAt_0 >= 0n && checkedAt_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('setAuthority',
                                     'argument 2 (argument 3 as invoked from Typescript)',
                                     'coverage-proof.compact line 207 char 1',
                                     'Uint<0..18446744073709551616>',
                                     checkedAt_0)
        }
        if (!(record_0.buffer instanceof ArrayBuffer && record_0.BYTES_PER_ELEMENT === 1 && record_0.length === 32)) {
          __compactRuntime.typeError('setAuthority',
                                     'argument 3 (argument 4 as invoked from Typescript)',
                                     'coverage-proof.compact line 207 char 1',
                                     'Bytes<32>',
                                     record_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(dot_0).concat(_descriptor_1.toValue(checkedAt_0).concat(_descriptor_0.toValue(record_0))),
            alignment: _descriptor_2.alignment().concat(_descriptor_1.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._setAuthority_0(context,
                                                    partialProofData,
                                                    dot_0,
                                                    checkedAt_0,
                                                    record_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      clearAuthority: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`clearAuthority: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const dot_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('clearAuthority',
                                     'argument 1 (as invoked from Typescript)',
                                     'coverage-proof.compact line 214 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(dot_0) === 'bigint' && dot_0 >= 0n && dot_0 <= 4294967295n)) {
          __compactRuntime.typeError('clearAuthority',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'coverage-proof.compact line 214 char 1',
                                     'Uint<0..4294967296>',
                                     dot_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_2.toValue(dot_0),
            alignment: _descriptor_2.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._clearAuthority_0(context,
                                                      partialProofData,
                                                      dot_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      setAuthorityMaxAge: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`setAuthorityMaxAge: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const seconds_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('setAuthorityMaxAge',
                                     'argument 1 (as invoked from Typescript)',
                                     'coverage-proof.compact line 219 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(typeof(seconds_0) === 'bigint' && seconds_0 >= 0n && seconds_0 <= 18446744073709551615n)) {
          __compactRuntime.typeError('setAuthorityMaxAge',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'coverage-proof.compact line 219 char 1',
                                     'Uint<0..18446744073709551616>',
                                     seconds_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(seconds_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._setAuthorityMaxAge_0(context,
                                                          partialProofData,
                                                          seconds_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      },
      rotateAdmin: async (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`rotateAdmin: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const newAdmin_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.callContext.currentQueryContext != undefined)) {
          __compactRuntime.typeError('rotateAdmin',
                                     'argument 1 (as invoked from Typescript)',
                                     'coverage-proof.compact line 224 char 1',
                                     'CircuitContext',
                                     contextOrig_0)
        }
        if (!(newAdmin_0.buffer instanceof ArrayBuffer && newAdmin_0.BYTES_PER_ELEMENT === 1 && newAdmin_0.length === 32)) {
          __compactRuntime.typeError('rotateAdmin',
                                     'argument 1 (argument 2 as invoked from Typescript)',
                                     'coverage-proof.compact line 224 char 1',
                                     'Bytes<32>',
                                     newAdmin_0)
        }
        const context = __compactRuntime.copyCircuitContext(contextOrig_0);
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(newAdmin_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = await this._rotateAdmin_0(context,
                                                   partialProofData,
                                                   newAdmin_0);
        partialProofData.output = { value: [], alignment: [] };
        __compactRuntime.finalizeCallProofData(context, partialProofData);
        return { result: result_0, context: context, gasCost: context.callContext.currentGasCost };
      }
    };
    this.impureCircuits = {
      proveCoverage: this.circuits.proveCoverage,
      registerAttestor: this.circuits.registerAttestor,
      removeAttestor: this.circuits.removeAttestor,
      revokeAttestation: this.circuits.revokeAttestation,
      setAuthority: this.circuits.setAuthority,
      clearAuthority: this.circuits.clearAuthority,
      setAuthorityMaxAge: this.circuits.setAuthorityMaxAge,
      rotateAdmin: this.circuits.rotateAdmin
    };
    this.provableCircuits = {
      proveCoverage: this.circuits.proveCoverage,
      registerAttestor: this.circuits.registerAttestor,
      removeAttestor: this.circuits.removeAttestor,
      revokeAttestation: this.circuits.revokeAttestation,
      setAuthority: this.circuits.setAuthority,
      clearAuthority: this.circuits.clearAuthority,
      setAuthorityMaxAge: this.circuits.setAuthorityMaxAge,
      rotateAdmin: this.circuits.rotateAdmin
    };
  }
  async initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = new __compactRuntime.ChargedState(stateValue_0);
    state_0.setOperation('proveCoverage', new __compactRuntime.ContractOperation());
    state_0.setOperation('registerAttestor', new __compactRuntime.ContractOperation());
    state_0.setOperation('removeAttestor', new __compactRuntime.ContractOperation());
    state_0.setOperation('revokeAttestation', new __compactRuntime.ContractOperation());
    state_0.setOperation('setAuthority', new __compactRuntime.ContractOperation());
    state_0.setOperation('clearAuthority', new __compactRuntime.ContractOperation());
    state_0.setOperation('setAuthorityMaxAge', new __compactRuntime.ContractOperation());
    state_0.setOperation('rotateAdmin', new __compactRuntime.ContractOperation());
    const context = __compactRuntime.createCircuitContext({circuitId: 'constructor', contractAddress: __compactRuntime.dummyContractAddress(), coinPublicKeyOrZswapState: constructorContext_0.initialZswapLocalState.coinPublicKey, contractState: state_0.data, privateState: constructorContext_0.initialPrivateState});
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(0n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(1n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(2n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(3n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(4n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newMap(
                                                          new __compactRuntime.StateMap()
                                                        ).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(5n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_0 = this._deriveAdminPublicKey_0(this._getSecretKey_0(context,
                                                                    partialProofData));
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(0n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    const tmp_1 = 604800n;
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(5n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(tmp_1),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    state_0.data = new __compactRuntime.ChargedState(context.callContext.currentQueryContext.state.state);
    return {
      currentContractState: state_0,
      currentPrivateState: context.callContext.currentPrivateState,
      currentZswapLocalState: context.callContext.currentZswapLocalState
    }
  }
  async _blockTimeLt_0(context, partialProofData, time_0) {
    return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                     partialProofData,
                                                                     [
                                                                      { dup: { n: 2 } },
                                                                      { idx: { cached: true,
                                                                               pushPath: false,
                                                                               path: [
                                                                                      { tag: 'value',
                                                                                        value: { value: _descriptor_30.toValue(2n),
                                                                                                 alignment: _descriptor_30.alignment() } }] } },
                                                                      { push: { storage: false,
                                                                                value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(time_0),
                                                                                                                             alignment: _descriptor_1.alignment() }).encode() } },
                                                                      'lt',
                                                                      { popeq: { cached: true,
                                                                                 result: undefined } }]).value);
  }
  _transientHash_0(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_0, value_0);
    return result_0;
  }
  _transientHash_1(value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_23, value_0);
    return result_0;
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_20, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_22, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_18, value_0);
    return result_0;
  }
  _jubjubPointX_0(pt_0) {
    const result_0 = __compactRuntime.jubjubPointX(pt_0);
    return result_0;
  }
  _jubjubPointY_0(pt_0) {
    const result_0 = __compactRuntime.jubjubPointY(pt_0);
    return result_0;
  }
  _ecAdd_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecAdd(a_0, b_0);
    return result_0;
  }
  _ecMul_0(a_0, b_0) {
    const result_0 = __compactRuntime.ecMul(a_0, b_0);
    return result_0;
  }
  _ecMulGenerator_0(b_0) {
    const result_0 = __compactRuntime.ecMulGenerator(b_0);
    return result_0;
  }
  _getSchnorrReduction_0(context, partialProofData, challengeHash_0) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getSchnorrReduction(witnessContext_0,
                                                                              challengeHash_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 2  && typeof(result_0[0]) === 'bigint' && result_0[0] >= 0n && result_0[0] <= 127n && typeof(result_0[1]) === 'bigint' && result_0[1] >= 0n && result_0[1] <= 452312848583266388373324160190187140051835877600158453279131187530910662655n)) {
      __compactRuntime.typeError('getSchnorrReduction',
                                 'return value',
                                 'schnorr.compact line 57 char 3',
                                 '[Uint<0..128>, Uint<0..452312848583266388373324160190187140051835877600158453279131187530910662656>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_16.toValue(result_0),
      alignment: _descriptor_16.alignment()
    });
    return result_0;
  }
  async _schnorrVerify_0(context, partialProofData, msg_0, signature_0, pk_0) {
    const __compact_pattern_tmp2_0 = signature_0;
    const announcement_0 = __compact_pattern_tmp2_0.announcement;
    const response_0 = __compact_pattern_tmp2_0.response;
    const cFull_0 = this._transientHash_1({ ann_x:
                                              this._jubjubPointX_0(announcement_0),
                                            ann_y:
                                              this._jubjubPointY_0(announcement_0),
                                            pk_x: this._jubjubPointX_0(pk_0),
                                            pk_y: this._jubjubPointY_0(pk_0),
                                            msg: msg_0 });
    const TWO_248_0 = 452312848583266388373324160190187140051835877600158453279131187530910662656n;
    const __compact_pattern_tmp1_0 = this._getSchnorrReduction_0(context,
                                                                 partialProofData,
                                                                 cFull_0);
    const q_0 = __compact_pattern_tmp1_0[0];
    const cTruncated_0 = __compact_pattern_tmp1_0[1];
    const qd_0 = q_0;
    const rd_0 = cTruncated_0;
    const R_MAX_AT_Q115_0 = 419897588050555816515462086314444731729426576509415695503572133883854979073n;
    __compactRuntime.assert(qd_0 < 115n
                            ||
                            qd_0 === 115n && rd_0 < R_MAX_AT_Q115_0,
                            'Schnorr quotient out of range');
    __compactRuntime.assert(__compactRuntime.addField(__compactRuntime.mulField(qd_0,
                                                                                TWO_248_0),
                                                      rd_0)
                            ===
                            cFull_0,
                            'Invalid challenge reduction');
    const c_0 = __compactRuntime.convertNumericToJubjubScalar(rd_0);
    const lhs_0 = this._ecMulGenerator_0(response_0);
    const rhs_0 = this._ecAdd_0(announcement_0, this._ecMul_0(pk_0, c_0));
    __compactRuntime.assert(this._jubjubPointX_0(lhs_0)
                            ===
                            this._jubjubPointX_0(rhs_0)
                            &&
                            this._jubjubPointY_0(lhs_0)
                            ===
                            this._jubjubPointY_0(rhs_0),
                            'Invalid attestation signature');
    return [];
  }
  _schnorrChallenge6_0(ann_x_0, ann_y_0, pk_x_0, pk_y_0, msg_0) {
    return this._transientHash_1({ ann_x: ann_x_0,
                                   ann_y: ann_y_0,
                                   pk_x: pk_x_0,
                                   pk_y: pk_y_0,
                                   msg: msg_0 });
  }
  _getSecretKey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getSecretKey(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.typeError('getSecretKey',
                                 'return value',
                                 'coverage-proof.compact line 91 char 1',
                                 'Bytes<32>',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _getCoverageAttestation_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.createWitnessContext(ledger(context.callContext.currentQueryContext.state), context.callContext.currentPrivateState, context.callContext.currentQueryContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.getCoverageAttestation(witnessContext_0);
    context.callContext.currentPrivateState = nextPrivateState_0;
    if (!(Array.isArray(result_0) && result_0.length === 4  && typeof(result_0[0]) === 'object' && typeof(result_0[0].dot) === 'bigint' && result_0[0].dot >= 0n && result_0[0].dot <= 4294967295n && typeof(result_0[0].liability) === 'bigint' && result_0[0].liability >= 0n && result_0[0].liability <= 4294967295n && typeof(result_0[0].cargo) === 'bigint' && result_0[0].cargo >= 0n && result_0[0].cargo <= 4294967295n && typeof(result_0[0].expiresAt) === 'bigint' && result_0[0].expiresAt >= 0n && result_0[0].expiresAt <= 18446744073709551615n && typeof(result_0[1]) === 'bigint' && result_0[1] >= 0 && result_0[1] <= __compactRuntime.MAX_FIELD && typeof(result_0[2]) === 'object' && typeof(result_0[2].announcement.x) === 'bigint' && result_0[2].announcement.x >= 0n && result_0[2].announcement.x <= __compactRuntime.MAX_FIELD && typeof(result_0[2].announcement.y) === 'bigint' && result_0[2].announcement.y >= 0n && result_0[2].announcement.y <= __compactRuntime.MAX_FIELD && typeof(result_0[2].response) === 'bigint' && result_0[2].response >= 0 && result_0[2].response <= __compactRuntime.MAX_JUBJUB_SCALAR && typeof(result_0[3]) === 'bigint' && result_0[3] >= 0n && result_0[3] <= 65535n)) {
      __compactRuntime.typeError('getCoverageAttestation',
                                 'return value',
                                 'coverage-proof.compact line 93 char 1',
                                 '[struct Coverage<dot: Uint<0..4294967296>, liability: Uint<0..4294967296>, cargo: Uint<0..4294967296>, expiresAt: Uint<0..18446744073709551616>>, Field, struct SchnorrSignature<announcement: JubjubPoint, response: JubjubScalar>, Uint<0..65536>]',
                                 result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_13.toValue(result_0),
      alignment: _descriptor_13.alignment()
    });
    return result_0;
  }
  _deriveCarrierPublicKey_0(sk_0) {
    return this._persistentHash_0([new Uint8Array([110, 105, 103, 104, 116, 108, 97, 110, 101, 58, 99, 97, 114, 114, 105, 101, 114, 58, 112, 107, 58, 118, 49]),
                                   sk_0]);
  }
  _deriveAdminPublicKey_0(sk_0) {
    return this._persistentHash_1([new Uint8Array([110, 105, 103, 104, 116, 108, 97, 110, 101, 58, 97, 100, 109, 105, 110, 58, 112, 107, 58, 118, 49]),
                                   sk_0]);
  }
  _attestationId_0(nonce_0) {
    return this._persistentHash_2([new Uint8Array([110, 105, 103, 104, 116, 108, 97, 110, 101, 58, 99, 111, 118, 58, 97, 116, 116, 58, 118, 49]),
                                   nonce_0]);
  }
  _attestationMessage_0(coverage_0, nonce_0, carrierPk_0) {
    return [coverage_0.dot,
            coverage_0.liability,
            coverage_0.cargo,
            coverage_0.expiresAt,
            nonce_0,
            this._transientHash_0(carrierPk_0)];
  }
  async _proveCoverage_0(context,
                         partialProofData,
                         requestId_0,
                         minLiability_0,
                         minCargo_0,
                         coveredThrough_0)
  {
    const __compact_pattern_tmp1_0 = this._getCoverageAttestation_0(context,
                                                                    partialProofData);
    const coverage_0 = __compact_pattern_tmp1_0[0];
    const nonce_0 = __compact_pattern_tmp1_0[1];
    const signature_0 = __compact_pattern_tmp1_0[2];
    const attestorId_0 = __compact_pattern_tmp1_0[3];
    const disclosedAttestorId_0 = attestorId_0;
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_30.toValue(1n),
                                                                                                                  alignment: _descriptor_30.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(disclosedAttestorId_0),
                                                                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Attestor not registered');
    const attestorPk_0 = _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                   partialProofData,
                                                                                   [
                                                                                    { dup: { n: 0 } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_30.toValue(1n),
                                                                                                               alignment: _descriptor_30.alignment() } }] } },
                                                                                    { idx: { cached: false,
                                                                                             pushPath: false,
                                                                                             path: [
                                                                                                    { tag: 'value',
                                                                                                      value: { value: _descriptor_4.toValue(disclosedAttestorId_0),
                                                                                                               alignment: _descriptor_4.alignment() } }] } },
                                                                                    { popeq: { cached: false,
                                                                                               result: undefined } }]).value);
    const carrierPk_0 = this._deriveCarrierPublicKey_0(this._getSecretKey_0(context,
                                                                            partialProofData));
    await this._schnorrVerify_0(context,
                                partialProofData,
                                this._attestationMessage_0(coverage_0,
                                                           nonce_0,
                                                           carrierPk_0),
                                signature_0,
                                attestorPk_0);
    let tmp_0;
    __compactRuntime.assert(!(tmp_0 = this._attestationId_0(nonce_0),
                              _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                        partialProofData,
                                                                                        [
                                                                                         { dup: { n: 0 } },
                                                                                         { idx: { cached: false,
                                                                                                  pushPath: false,
                                                                                                  path: [
                                                                                                         { tag: 'value',
                                                                                                           value: { value: _descriptor_30.toValue(2n),
                                                                                                                    alignment: _descriptor_30.alignment() } }] } },
                                                                                         { push: { storage: false,
                                                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_0),
                                                                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                                                                         'member',
                                                                                         { popeq: { cached: true,
                                                                                                    result: undefined } }]).value)),
                            'Attestation was revoked');
    const dot_0 = coverage_0.dot;
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_30.toValue(4n),
                                                                                                                  alignment: _descriptor_30.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(dot_0),
                                                                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'No current FMCSA authority check for this carrier');
    const status_0 = _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_30.toValue(4n),
                                                                                                           alignment: _descriptor_30.alignment() } }] } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_2.toValue(dot_0),
                                                                                                           alignment: _descriptor_2.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value);
    __compactRuntime.assert(await this._blockTimeLt_0(context,
                                                      partialProofData,
                                                      ((t1) => {
                                                        if (t1 > 18446744073709551615n) {
                                                          throw new __compactRuntime.CompactError('coverage-proof.compact line 156 char 24: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                                                        }
                                                        return t1;
                                                      })(status_0.checkedAt
                                                         +
                                                         _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                                   partialProofData,
                                                                                                                   [
                                                                                                                    { dup: { n: 0 } },
                                                                                                                    { idx: { cached: false,
                                                                                                                             pushPath: false,
                                                                                                                             path: [
                                                                                                                                    { tag: 'value',
                                                                                                                                      value: { value: _descriptor_30.toValue(5n),
                                                                                                                                               alignment: _descriptor_30.alignment() } }] } },
                                                                                                                    { popeq: { cached: false,
                                                                                                                               result: undefined } }]).value))),
                            'FMCSA authority check is too old');
    let t_0;
    __compactRuntime.assert((t_0 = coverage_0.liability, t_0 >= minLiability_0),
                            'Liability below the requested minimum');
    let t_1;
    __compactRuntime.assert((t_1 = coverage_0.cargo, t_1 >= minCargo_0),
                            'Cargo coverage below the requested minimum');
    let t_2;
    __compactRuntime.assert((t_2 = coverage_0.expiresAt, t_2 >= coveredThrough_0),
                            'Coverage ends before the requested date');
    __compactRuntime.assert(await this._blockTimeLt_0(context,
                                                      partialProofData,
                                                      coveredThrough_0),
                            'Requested date is already in the past');
    const disclosedRequestId_0 = requestId_0;
    __compactRuntime.assert(!_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_30.toValue(3n),
                                                                                                                   alignment: _descriptor_30.alignment() } }] } },
                                                                                        { push: { storage: false,
                                                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(disclosedRequestId_0),
                                                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                                                        'member',
                                                                                        { popeq: { cached: true,
                                                                                                   result: undefined } }]).value),
                            'Request already answered');
    const tmp_1 = { dot: dot_0,
                    minLiability: minLiability_0,
                    minCargo: minCargo_0,
                    coveredThrough: coveredThrough_0,
                    attestorId: disclosedAttestorId_0,
                    authorityCheckedAt: status_0.checkedAt,
                    authorityRecord: status_0.record };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_30.toValue(3n),
                                                                  alignment: _descriptor_30.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(disclosedRequestId_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_10.toValue(tmp_1),
                                                                                              alignment: _descriptor_10.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _coverageChallenge_0(ann_x_0, ann_y_0, pk_x_0, pk_y_0, msg_0) {
    return this._schnorrChallenge6_0(ann_x_0, ann_y_0, pk_x_0, pk_y_0, msg_0);
  }
  async _registerAttestor_0(context, partialProofData, id_0, pk_0) {
    __compactRuntime.assert(this._equal_0(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_30.toValue(0n),
                                                                                                                                alignment: _descriptor_30.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._deriveAdminPublicKey_0(this._getSecretKey_0(context,
                                                                                            partialProofData))),
                            'Only admin can register attestors');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_30.toValue(1n),
                                                                  alignment: _descriptor_30.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(id_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(pk_0),
                                                                                              alignment: _descriptor_5.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _removeAttestor_0(context, partialProofData, id_0) {
    __compactRuntime.assert(this._equal_1(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_30.toValue(0n),
                                                                                                                                alignment: _descriptor_30.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._deriveAdminPublicKey_0(this._getSecretKey_0(context,
                                                                                            partialProofData))),
                            'Only admin can remove attestors');
    __compactRuntime.assert(_descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                      partialProofData,
                                                                                      [
                                                                                       { dup: { n: 0 } },
                                                                                       { idx: { cached: false,
                                                                                                pushPath: false,
                                                                                                path: [
                                                                                                       { tag: 'value',
                                                                                                         value: { value: _descriptor_30.toValue(1n),
                                                                                                                  alignment: _descriptor_30.alignment() } }] } },
                                                                                       { push: { storage: false,
                                                                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(id_0),
                                                                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                                                                       'member',
                                                                                       { popeq: { cached: true,
                                                                                                  result: undefined } }]).value),
                            'Attestor not found');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_30.toValue(1n),
                                                                  alignment: _descriptor_30.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(id_0),
                                                                                              alignment: _descriptor_4.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _revokeAttestation_0(context, partialProofData, id_0) {
    __compactRuntime.assert(this._equal_2(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_30.toValue(0n),
                                                                                                                                alignment: _descriptor_30.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._deriveAdminPublicKey_0(this._getSecretKey_0(context,
                                                                                            partialProofData))),
                            'Only admin can revoke attestations');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_30.toValue(2n),
                                                                  alignment: _descriptor_30.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(id_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newNull().encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _setAuthority_0(context, partialProofData, dot_0, checkedAt_0, record_0)
  {
    __compactRuntime.assert(this._equal_3(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_30.toValue(0n),
                                                                                                                                alignment: _descriptor_30.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._deriveAdminPublicKey_0(this._getSecretKey_0(context,
                                                                                            partialProofData))),
                            'Only admin can set authority');
    const tmp_0 = { checkedAt: checkedAt_0, record: record_0 };
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_30.toValue(4n),
                                                                  alignment: _descriptor_30.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(dot_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(tmp_0),
                                                                                              alignment: _descriptor_3.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _clearAuthority_0(context, partialProofData, dot_0) {
    __compactRuntime.assert(this._equal_4(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_30.toValue(0n),
                                                                                                                                alignment: _descriptor_30.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._deriveAdminPublicKey_0(this._getSecretKey_0(context,
                                                                                            partialProofData))),
                            'Only admin can clear authority');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { idx: { cached: false,
                                                pushPath: true,
                                                path: [
                                                       { tag: 'value',
                                                         value: { value: _descriptor_30.toValue(4n),
                                                                  alignment: _descriptor_30.alignment() } }] } },
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(dot_0),
                                                                                              alignment: _descriptor_2.alignment() }).encode() } },
                                       { rem: { cached: false } },
                                       { ins: { cached: true, n: 1 } }]);
    return [];
  }
  async _setAuthorityMaxAge_0(context, partialProofData, seconds_0) {
    __compactRuntime.assert(this._equal_5(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_30.toValue(0n),
                                                                                                                                alignment: _descriptor_30.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._deriveAdminPublicKey_0(this._getSecretKey_0(context,
                                                                                            partialProofData))),
                            'Only admin can set the authority max age');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(5n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(seconds_0),
                                                                                              alignment: _descriptor_1.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  async _rotateAdmin_0(context, partialProofData, newAdmin_0) {
    __compactRuntime.assert(this._equal_6(_descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                                                    partialProofData,
                                                                                                    [
                                                                                                     { dup: { n: 0 } },
                                                                                                     { idx: { cached: false,
                                                                                                              pushPath: false,
                                                                                                              path: [
                                                                                                                     { tag: 'value',
                                                                                                                       value: { value: _descriptor_30.toValue(0n),
                                                                                                                                alignment: _descriptor_30.alignment() } }] } },
                                                                                                     { popeq: { cached: false,
                                                                                                                result: undefined } }]).value),
                                          this._deriveAdminPublicKey_0(this._getSecretKey_0(context,
                                                                                            partialProofData))),
                            'Only admin can rotate admin role');
    __compactRuntime.queryLedgerState(context,
                                      partialProofData,
                                      [
                                       { push: { storage: false,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_30.toValue(0n),
                                                                                              alignment: _descriptor_30.alignment() }).encode() } },
                                       { push: { storage: true,
                                                 value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(newAdmin_0),
                                                                                              alignment: _descriptor_0.alignment() }).encode() } },
                                       { ins: { cached: false, n: 1 } }]);
    return [];
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_1(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_2(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_3(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_4(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_5(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  _equal_6(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
}
export function ledger(stateOrChargedState) {
  const state = stateOrChargedState instanceof __compactRuntime.StateValue ? stateOrChargedState : stateOrChargedState.state;
  const chargedState = stateOrChargedState instanceof __compactRuntime.StateValue ? new __compactRuntime.ChargedState(stateOrChargedState) : stateOrChargedState;
  const context = {
    callContext: { currentQueryContext: new __compactRuntime.QueryContext(chargedState, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() },
    costModel: __compactRuntime.CostModel.initialCostModel()
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get contractAdmin() {
      return _descriptor_0.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_30.toValue(0n),
                                                                                                   alignment: _descriptor_30.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    },
    attestors: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(1n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(1n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 65535n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'coverage-proof.compact line 81 char 1',
                                     'Uint<0..65536>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(1n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(key_0),
                                                                                                                                 alignment: _descriptor_4.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 65535n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'coverage-proof.compact line 81 char 1',
                                     'Uint<0..65536>',
                                     key_0)
        }
        return _descriptor_5.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(1n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_4.toValue(key_0),
                                                                                                     alignment: _descriptor_4.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[1];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_4.fromValue(key.value),      _descriptor_5.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    revoked: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(2n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(2n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const elem_0 = args_0[0];
        if (!(elem_0.buffer instanceof ArrayBuffer && elem_0.BYTES_PER_ELEMENT === 1 && elem_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'coverage-proof.compact line 83 char 1',
                                     'Bytes<32>',
                                     elem_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(2n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(elem_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map((elem) => _descriptor_0.fromValue(elem.value))[Symbol.iterator]();
      }
    },
    proofs: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(3n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(3n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'coverage-proof.compact line 85 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(3n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                                 alignment: _descriptor_0.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'coverage-proof.compact line 85 char 1',
                                     'Bytes<32>',
                                     key_0)
        }
        return _descriptor_10.fromValue(__compactRuntime.queryLedgerState(context,
                                                                          partialProofData,
                                                                          [
                                                                           { dup: { n: 0 } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_30.toValue(3n),
                                                                                                      alignment: _descriptor_30.alignment() } }] } },
                                                                           { idx: { cached: false,
                                                                                    pushPath: false,
                                                                                    path: [
                                                                                           { tag: 'value',
                                                                                             value: { value: _descriptor_0.toValue(key_0),
                                                                                                      alignment: _descriptor_0.alignment() } }] } },
                                                                           { popeq: { cached: false,
                                                                                      result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[3];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_10.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    authority: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(4n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          'size',
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(0n),
                                                                                                                                 alignment: _descriptor_1.alignment() }).encode() } },
                                                                          'eq',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(4n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          'size',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 4294967295n)) {
          __compactRuntime.typeError('member',
                                     'argument 1',
                                     'coverage-proof.compact line 87 char 1',
                                     'Uint<0..4294967296>',
                                     key_0)
        }
        return _descriptor_6.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(4n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          { push: { storage: false,
                                                                                    value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(key_0),
                                                                                                                                 alignment: _descriptor_2.alignment() }).encode() } },
                                                                          'member',
                                                                          { popeq: { cached: true,
                                                                                     result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(typeof(key_0) === 'bigint' && key_0 >= 0n && key_0 <= 4294967295n)) {
          __compactRuntime.typeError('lookup',
                                     'argument 1',
                                     'coverage-proof.compact line 87 char 1',
                                     'Uint<0..4294967296>',
                                     key_0)
        }
        return _descriptor_3.fromValue(__compactRuntime.queryLedgerState(context,
                                                                         partialProofData,
                                                                         [
                                                                          { dup: { n: 0 } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_30.toValue(4n),
                                                                                                     alignment: _descriptor_30.alignment() } }] } },
                                                                          { idx: { cached: false,
                                                                                   pushPath: false,
                                                                                   path: [
                                                                                          { tag: 'value',
                                                                                            value: { value: _descriptor_2.toValue(key_0),
                                                                                                     alignment: _descriptor_2.alignment() } }] } },
                                                                          { popeq: { cached: false,
                                                                                     result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_2.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    get authorityMaxAge() {
      return _descriptor_1.fromValue(__compactRuntime.queryLedgerState(context,
                                                                       partialProofData,
                                                                       [
                                                                        { dup: { n: 0 } },
                                                                        { idx: { cached: false,
                                                                                 pushPath: false,
                                                                                 path: [
                                                                                        { tag: 'value',
                                                                                          value: { value: _descriptor_30.toValue(5n),
                                                                                                   alignment: _descriptor_30.alignment() } }] } },
                                                                        { popeq: { cached: false,
                                                                                   result: undefined } }]).value);
    }
  };
}
const _emptyContext = {
  callContext: { currentQueryContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress()), currentGasCost: __compactRuntime.emptyRunningCost() }
};
const _dummyContract = new Contract({
  getSchnorrReduction: (...args) => undefined,
  getSecretKey: (...args) => undefined,
  getCoverageAttestation: (...args) => undefined
});
export const pureCircuits = {
  deriveCarrierPublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`deriveCarrierPublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('deriveCarrierPublicKey',
                                 'argument 1',
                                 'coverage-proof.compact line 95 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._deriveCarrierPublicKey_0(sk_0);
  },
  deriveAdminPublicKey: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`deriveAdminPublicKey: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const sk_0 = args_0[0];
    if (!(sk_0.buffer instanceof ArrayBuffer && sk_0.BYTES_PER_ELEMENT === 1 && sk_0.length === 32)) {
      __compactRuntime.typeError('deriveAdminPublicKey',
                                 'argument 1',
                                 'coverage-proof.compact line 102 char 1',
                                 'Bytes<32>',
                                 sk_0)
    }
    return _dummyContract._deriveAdminPublicKey_0(sk_0);
  },
  attestationId: (...args_0) => {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`attestationId: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const nonce_0 = args_0[0];
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0 && nonce_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('attestationId',
                                 'argument 1',
                                 'coverage-proof.compact line 111 char 1',
                                 'Field',
                                 nonce_0)
    }
    return _dummyContract._attestationId_0(nonce_0);
  },
  attestationMessage: (...args_0) => {
    if (args_0.length !== 3) {
      throw new __compactRuntime.CompactError(`attestationMessage: expected 3 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const coverage_0 = args_0[0];
    const nonce_0 = args_0[1];
    const carrierPk_0 = args_0[2];
    if (!(typeof(coverage_0) === 'object' && typeof(coverage_0.dot) === 'bigint' && coverage_0.dot >= 0n && coverage_0.dot <= 4294967295n && typeof(coverage_0.liability) === 'bigint' && coverage_0.liability >= 0n && coverage_0.liability <= 4294967295n && typeof(coverage_0.cargo) === 'bigint' && coverage_0.cargo >= 0n && coverage_0.cargo <= 4294967295n && typeof(coverage_0.expiresAt) === 'bigint' && coverage_0.expiresAt >= 0n && coverage_0.expiresAt <= 18446744073709551615n)) {
      __compactRuntime.typeError('attestationMessage',
                                 'argument 1',
                                 'coverage-proof.compact line 120 char 1',
                                 'struct Coverage<dot: Uint<0..4294967296>, liability: Uint<0..4294967296>, cargo: Uint<0..4294967296>, expiresAt: Uint<0..18446744073709551616>>',
                                 coverage_0)
    }
    if (!(typeof(nonce_0) === 'bigint' && nonce_0 >= 0 && nonce_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('attestationMessage',
                                 'argument 2',
                                 'coverage-proof.compact line 120 char 1',
                                 'Field',
                                 nonce_0)
    }
    if (!(carrierPk_0.buffer instanceof ArrayBuffer && carrierPk_0.BYTES_PER_ELEMENT === 1 && carrierPk_0.length === 32)) {
      __compactRuntime.typeError('attestationMessage',
                                 'argument 3',
                                 'coverage-proof.compact line 120 char 1',
                                 'Bytes<32>',
                                 carrierPk_0)
    }
    return _dummyContract._attestationMessage_0(coverage_0, nonce_0, carrierPk_0);
  },
  coverageChallenge: (...args_0) => {
    if (args_0.length !== 5) {
      throw new __compactRuntime.CompactError(`coverageChallenge: expected 5 arguments (as invoked from Typescript), received ${args_0.length}`);
    }
    const ann_x_0 = args_0[0];
    const ann_y_0 = args_0[1];
    const pk_x_0 = args_0[2];
    const pk_y_0 = args_0[3];
    const msg_0 = args_0[4];
    if (!(typeof(ann_x_0) === 'bigint' && ann_x_0 >= 0 && ann_x_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('coverageChallenge',
                                 'argument 1',
                                 'coverage-proof.compact line 181 char 1',
                                 'Field',
                                 ann_x_0)
    }
    if (!(typeof(ann_y_0) === 'bigint' && ann_y_0 >= 0 && ann_y_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('coverageChallenge',
                                 'argument 2',
                                 'coverage-proof.compact line 181 char 1',
                                 'Field',
                                 ann_y_0)
    }
    if (!(typeof(pk_x_0) === 'bigint' && pk_x_0 >= 0 && pk_x_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('coverageChallenge',
                                 'argument 3',
                                 'coverage-proof.compact line 181 char 1',
                                 'Field',
                                 pk_x_0)
    }
    if (!(typeof(pk_y_0) === 'bigint' && pk_y_0 >= 0 && pk_y_0 <= __compactRuntime.MAX_FIELD)) {
      __compactRuntime.typeError('coverageChallenge',
                                 'argument 4',
                                 'coverage-proof.compact line 181 char 1',
                                 'Field',
                                 pk_y_0)
    }
    if (!(Array.isArray(msg_0) && msg_0.length === 6 && msg_0.every((t) => typeof(t) === 'bigint' && t >= 0 && t <= __compactRuntime.MAX_FIELD))) {
      __compactRuntime.typeError('coverageChallenge',
                                 'argument 5',
                                 'coverage-proof.compact line 181 char 1',
                                 'Vector<6, Field>',
                                 msg_0)
    }
    return _dummyContract._coverageChallenge_0(ann_x_0,
                                               ann_y_0,
                                               pk_x_0,
                                               pk_y_0,
                                               msg_0);
  }
};
export const expectedVk = {};

export const circuitSignatures = {
  'deriveCarrierPublicKey': {pure: true, provable: false, argumentTypes: [{tag: 'Alias', name: 'SecretKey', type: {tag: 'Bytes', length: 32}}], resultType: {tag: 'Alias', name: 'CarrierPublicKey', type: {tag: 'Bytes', length: 32}}},
  'deriveAdminPublicKey': {pure: true, provable: false, argumentTypes: [{tag: 'Alias', name: 'SecretKey', type: {tag: 'Bytes', length: 32}}], resultType: {tag: 'Alias', name: 'AdminPublicKey', type: {tag: 'Bytes', length: 32}}},
  'attestationId': {pure: true, provable: false, argumentTypes: [{tag: 'Field'}], resultType: {tag: 'Bytes', length: 32}},
  'attestationMessage': {pure: true, provable: false, argumentTypes: [{tag: 'Struct', name: 'Coverage', elements: [{name: 'dot', type: {tag: 'Uint', maxval: '4294967295'}}, {name: 'liability', type: {tag: 'Uint', maxval: '4294967295'}}, {name: 'cargo', type: {tag: 'Uint', maxval: '4294967295'}}, {name: 'expiresAt', type: {tag: 'Uint', maxval: '18446744073709551615'}}]}, {tag: 'Field'}, {tag: 'Alias', name: 'CarrierPublicKey', type: {tag: 'Bytes', length: 32}}], resultType: {tag: 'Vector', length: 6, type: {tag: 'Field'}}},
  'proveCoverage': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}, {tag: 'Uint', maxval: '4294967295'}, {tag: 'Uint', maxval: '4294967295'}, {tag: 'Uint', maxval: '18446744073709551615'}], resultType: {tag: 'Tuple', types: []}},
  'coverageChallenge': {pure: true, provable: false, argumentTypes: [{tag: 'Field'}, {tag: 'Field'}, {tag: 'Field'}, {tag: 'Field'}, {tag: 'Vector', length: 6, type: {tag: 'Field'}}], resultType: {tag: 'Field'}},
  'registerAttestor': {pure: false, provable: true, argumentTypes: [{tag: 'Uint', maxval: '65535'}, {tag: 'JubjubPoint'}], resultType: {tag: 'Tuple', types: []}},
  'removeAttestor': {pure: false, provable: true, argumentTypes: [{tag: 'Uint', maxval: '65535'}], resultType: {tag: 'Tuple', types: []}},
  'revokeAttestation': {pure: false, provable: true, argumentTypes: [{tag: 'Bytes', length: 32}], resultType: {tag: 'Tuple', types: []}},
  'setAuthority': {pure: false, provable: true, argumentTypes: [{tag: 'Uint', maxval: '4294967295'}, {tag: 'Uint', maxval: '18446744073709551615'}, {tag: 'Bytes', length: 32}], resultType: {tag: 'Tuple', types: []}},
  'clearAuthority': {pure: false, provable: true, argumentTypes: [{tag: 'Uint', maxval: '4294967295'}], resultType: {tag: 'Tuple', types: []}},
  'setAuthorityMaxAge': {pure: false, provable: true, argumentTypes: [{tag: 'Uint', maxval: '18446744073709551615'}], resultType: {tag: 'Tuple', types: []}},
  'rotateAdmin': {pure: false, provable: true, argumentTypes: [{tag: 'Alias', name: 'AdminPublicKey', type: {tag: 'Bytes', length: 32}}], resultType: {tag: 'Tuple', types: []}},
};

export const declaredInterfaces = {};

//# sourceMappingURL=index.js.map
